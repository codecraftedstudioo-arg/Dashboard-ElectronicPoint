import { calculatePrice } from "@/lib/cotizador/pricing-engine";
import { loadActiveQuoteConfig } from "@/lib/cotizador/pricing-source";
import { resolveTradeTarget } from "@/lib/cotizador/trade-target";
import { parseQuoteInput } from "@/lib/cotizador/validate";
import type { PriceResult, PublicTradeTarget } from "@/lib/cotizador/types";

export type QuoteSuccess = PriceResult & {
  ok: true;
  demo: boolean;
  target: PublicTradeTarget | null;
  difference: number | null;
};

export type QuoteFailure = { ok: false; message: string };

export async function createQuote(body: unknown): Promise<QuoteSuccess | QuoteFailure> {
  const parsed = parseQuoteInput(body);
  if (!parsed.ok) return parsed;

  const active = await loadActiveQuoteConfig();
  const price = calculatePrice(parsed.value.answers, active.config);
  if (!price) {
    return {
      ok: false,
      message: active.demo
        ? "No hay un valor de demostración para ese modelo y capacidad."
        : "No hay un valor para ese modelo y capacidad.",
    };
  }

  const target = await resolveTradeTarget(parsed.value.equipo);
  const difference = target ? target.salePrice - price.finalPrice : null;

  return {
    ok: true,
    demo: active.demo,
    ...price,
    target,
    difference,
  };
}
