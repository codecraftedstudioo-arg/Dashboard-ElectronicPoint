import { demoConfig, type EngineConfig } from "@/lib/cotizador/pricing-engine";
import { parseDraftInput, toEngineConfig } from "@/lib/cotizador/pricing-draft";
import { isMissingQuoteTable } from "@/lib/cotizador/pricing-admin";
import { prisma } from "@/lib/prisma";

export type ActiveQuoteConfig = {
  demo: boolean;
  config: EngineConfig;
};

function revisionsReady(): boolean {
  return typeof prisma.quotePricingRevision?.findFirst === "function";
}

/** Published commercial config, or the demo JSON when nothing is active. */
export async function loadActiveQuoteConfig(): Promise<ActiveQuoteConfig> {
  if (!revisionsReady()) return { demo: true, config: demoConfig };

  try {
    const row = await prisma.quotePricingRevision.findFirst({
      where: { status: "PUBLISHED" },
      include: { basePrices: true, penalties: true },
    });
    if (!row) return { demo: true, config: demoConfig };

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
        value: Number(penalty.value),
      })),
    });
    if (!parsed.ok) return { demo: true, config: demoConfig };
    return { demo: false, config: toEngineConfig(parsed.value) };
  } catch (error) {
    if (isMissingQuoteTable(error)) return { demo: true, config: demoConfig };
    throw error;
  }
}
