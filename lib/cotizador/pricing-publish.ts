import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { parseDraftInput } from "@/lib/cotizador/pricing-draft";
import { isMissingQuoteTable, PENDING_MIGRATION_MESSAGE } from "@/lib/cotizador/pricing-admin";

export const QUOTE_ACTOR = "panel";
const PUBLISH_LOCK = 814201512;

const ACTIVATE_CONFIRM =
  "Confirmá la activación antes de aplicarla al cotizador público.";
const DEACTIVATE_CONFIRM =
  "Confirmá la desactivación antes de volver a la demostración.";

export function activationConfirmed(
  confirm: unknown,
): { ok: true } | { ok: false; message: string } {
  if (confirm !== true) return { ok: false, message: ACTIVATE_CONFIRM };
  return { ok: true };
}

export function deactivationConfirmed(
  confirm: unknown,
): { ok: true } | { ok: false; message: string } {
  if (confirm !== true) return { ok: false, message: DEACTIVATE_CONFIRM };
  return { ok: true };
}

type StoredRow = {
  id: string;
  status: "DRAFT" | "PUBLISHED";
  note: string | null;
  basePrices: { model: string; storage: string; priceUsd: number }[];
  penalties: { key: string; kind: "PERCENTAGE" | "FIXED_USD"; value: Prisma.Decimal | number | string }[];
};

function draftFromRow(row: StoredRow) {
  return parseDraftInput({
    note: row.note,
    prices: row.basePrices.map((price) => ({
      model: price.model,
      storage: price.storage,
      priceUsd: price.priceUsd,
    })),
    penalties: row.penalties.map((penalty) => ({
      key: penalty.key,
      kind: penalty.kind,
      value: Number(penalty.value),
    })),
  });
}

async function lockPublish(tx: Prisma.TransactionClient) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(${PUBLISH_LOCK})`;
}

export async function activateStoredRevision(
  id: string,
  actor: string,
): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
  const name = actor.trim();
  if (!id || name.length === 0) {
    return { ok: false, message: "No se pudo identificar la revisión o el administrador." };
  }

  try {
    return await prisma.$transaction(async (tx) => {
      await lockPublish(tx);
      const row = await tx.quotePricingRevision.findUnique({
        where: { id },
        include: { basePrices: true, penalties: true },
      });
      if (!row) return { ok: false, message: "No encontramos esa revisión." };

      const parsed = draftFromRow(row);
      if (!parsed.ok) return parsed;
      if (row.status === "PUBLISHED") return { ok: true, id: row.id };

      await tx.quotePricingRevision.updateMany({
        where: { status: "PUBLISHED" },
        data: { status: "DRAFT" },
      });
      const updated = await tx.quotePricingRevision.update({
        where: { id: row.id },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
          publishedBy: name,
        },
        select: { id: true, status: true },
      });
      if (updated.status !== "PUBLISHED") {
        throw new Error("La activación no quedó persistida.");
      }
      return { ok: true, id: updated.id };
    });
  } catch (error) {
    if (isMissingQuoteTable(error)) {
      return { ok: false, message: PENDING_MIGRATION_MESSAGE };
    }
    return {
      ok: false,
      message: "No se pudo activar la revisión. La configuración vigente no cambió.",
    };
  }
}

export async function deactivateStoredRevision(
  id: string,
): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
  if (!id) return { ok: false, message: "No encontramos esa revisión." };

  try {
    return await prisma.$transaction(async (tx) => {
      await lockPublish(tx);
      const row = await tx.quotePricingRevision.findUnique({
        where: { id },
        select: { id: true, status: true },
      });
      if (!row) return { ok: false, message: "No encontramos esa revisión." };
      if (row.status !== "PUBLISHED") {
        return { ok: false, message: "Esa revisión no está vigente." };
      }
      await tx.quotePricingRevision.update({
        where: { id: row.id },
        data: { status: "DRAFT" },
      });
      const remaining = await tx.quotePricingRevision.count({
        where: { status: "PUBLISHED" },
      });
      if (remaining !== 0) {
        throw new Error("Quedó más de una revisión vigente.");
      }
      return { ok: true, id: row.id };
    });
  } catch (error) {
    if (isMissingQuoteTable(error)) {
      return { ok: false, message: PENDING_MIGRATION_MESSAGE };
    }
    return {
      ok: false,
      message: "No se pudo desactivar la revisión. La configuración vigente no cambió.",
    };
  }
}

export async function activateQuoteRevision(id: string, confirm: unknown) {
  await requireAdmin();
  const confirmed = activationConfirmed(confirm);
  if (!confirmed.ok) return confirmed;
  return activateStoredRevision(id, QUOTE_ACTOR);
}

export async function deactivateQuoteRevision(id: string, confirm: unknown) {
  await requireAdmin();
  const confirmed = deactivationConfirmed(confirm);
  if (!confirmed.ok) return confirmed;
  return deactivateStoredRevision(id);
}
