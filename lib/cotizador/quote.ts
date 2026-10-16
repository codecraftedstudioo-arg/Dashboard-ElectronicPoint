import { calculatePrice } from "@/lib/cotizador/pricing-engine";
import { loadActiveQuoteConfig } from "@/lib/cotizador/pricing-source";
import { resolveTradeTarget } from "@/lib/cotizador/trade-target";
import { parseQuoteInput } from "@/lib/cotizador/validate";
import type { PriceResult, PublicTradeTarget } from "@/lib/cotizador/types";

/** Applied only to “Solo quiero vender”. Plan Canje keeps the full take value. */
export const SELL_ONLY_DISCOUNT_USD = 50;

export type QuoteSuccess = PriceResult & {
  ok: true;
  demo: boolean;
  target: PublicTradeTarget | null;
  difference: number | null;
};

export type QuoteFailure = { ok: false; message: string };

export function applySellOnlyDiscount(
  finalPrice: number,
  isPlanCanje: boolean,
): number {
  if (isPlanCanje) return finalPrice;
  return Math.max(0, finalPrice - SELL_ONLY_DISCOUNT_USD);
}

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
  const isPlanCanje = target !== null;
  const finalPrice = applySellOnlyDiscount(price.finalPrice, isPlanCanje);
  const difference = target ? target.salePrice - finalPrice : null;

  return {
    ok: true,
    demo: active.demo,
    ...price,
    finalPrice,
    target,
    difference,
  };
}
