import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  demoQuoteDraft,
  parseDraftInput,
  type QuoteDraftInput,
} from "@/lib/cotizador/pricing-draft";

export const PENDING_MIGRATION_MESSAGE =
  "El guardado está pendiente de aplicar la migración. Las cotizaciones públicas siguen usando la demostración.";

export type StoredRevision = {
  id: string;
  status: "DRAFT" | "PUBLISHED";
  note: string | null;
  createdBy: string;
  createdAt: string;
  publishedAt: string | null;
  publishedBy: string | null;
  draft: QuoteDraftInput;
};

export type QuoteAdminState = {
  demo: QuoteDraftInput;
  revisions: StoredRevision[];
  pendingMigration: boolean;
};

export function isMissingQuoteTable(error: unknown): boolean {
  if (error instanceof TypeError && /findMany|create/.test(error.message)) return true;
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = String((error as { code: unknown }).code);
    if (code === "P2021" || code === "P2022") return true;
  }
  const message = error instanceof Error ? error.message : "";
  return (
    message.includes("42P01") ||
    (/QuotePricingRevision|QuoteBasePrice|QuotePenalty/.test(message) &&
      /does not exist/i.test(message))
  );
}

function quoteRevisionsReady(): boolean {
  return typeof prisma.quotePricingRevision?.findMany === "function";
}

function toNumber(value: Prisma.Decimal | number | string): number {
  return Number(value);
}

export async function loadQuoteAdminState(): Promise<QuoteAdminState> {
  await requireAdmin();
  const demo = demoQuoteDraft();
  if (!quoteRevisionsReady()) {
    return { demo, revisions: [], pendingMigration: true };
  }
  try {
    const rows = await prisma.quotePricingRevision.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        basePrices: { orderBy: { model: "asc" } },
        penalties: true,
      },
    });

    const revisions: StoredRevision[] = [];
    for (const row of rows) {
      const parsed = parseDraftInput({
        note: row.note,
        prices: row.basePrices.map((price) => ({
          model: price.model,
          storage: price.storage,
          priceUsd: price.priceUsd,
        })),
        penalties: row.penalties.map((penalty) => ({
          key: penalty.key,
          kind: penalty.kind,
          value: toNumber(penalty.value),
        })),
      });
      if (!parsed.ok) continue;
      revisions.push({
        id: row.id,
        status: row.status,
        note: parsed.value.note,
        createdBy: row.createdBy,
        createdAt: row.createdAt.toISOString(),
        publishedAt: row.publishedAt?.toISOString() ?? null,
        publishedBy: row.publishedBy,
        draft: parsed.value,
      });
    }

    return { demo, revisions, pendingMigration: false };
  } catch (error) {
    if (isMissingQuoteTable(error)) {
      return { demo, revisions: [], pendingMigration: true };
    }
    throw error;
  }
}

export async function saveQuoteDraft(
  input: unknown,
): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
  await requireAdmin();
  const parsed = parseDraftInput(input);
  if (!parsed.ok) return parsed;
  if (!quoteRevisionsReady()) {
    return { ok: false, message: PENDING_MIGRATION_MESSAGE };
  }

  try {
    const created = await prisma.quotePricingRevision.create({
      data: {
        status: "DRAFT",
        currency: "USD",
        note: parsed.value.note,
        createdBy: "panel",
        publishedAt: null,
        publishedBy: null,
        basePrices: {
          create: parsed.value.prices.map((price) => ({
            model: price.model,
            storage: price.storage,
            priceUsd: price.priceUsd,
          })),
        },
        penalties: {
          create: parsed.value.penalties.map((penalty) => ({
            key: penalty.key,
            kind: penalty.kind,
            value: penalty.value.toFixed(4),
          })),
        },
      },
      select: { id: true, status: true },
    });
    if (created.status !== "DRAFT") {
      return { ok: false, message: "No se pudo guardar el borrador." };
    }
    return { ok: true, id: created.id };
  } catch (error) {
    if (isMissingQuoteTable(error)) {
      return { ok: false, message: PENDING_MIGRATION_MESSAGE };
    }
    return { ok: false, message: "No se pudo guardar el borrador." };
  }
}
