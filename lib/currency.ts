import { convertUsdToArs } from "@/lib/exchange-rate";

export type CurrencyCode = "USD" | "ARS";

export const DEFAULT_CURRENCY: CurrencyCode = "USD";
export const CURRENCY_COOKIE = "stock-apple-currency";
export const CURRENCY_STORAGE_KEY = "stock-apple-currency";

export const CURRENCIES: Record<
  CurrencyCode,
  { code: CurrencyCode; label: string; symbol: string }
> = {
  USD: { code: "USD", label: "Dólar estadounidense", symbol: "$" },
  ARS: { code: "ARS", label: "Peso argentino", symbol: "$" },
};

export function parseCurrency(
  value: string | null | undefined,
): CurrencyCode {
  return value === "ARS" ? "ARS" : "USD";
}

/** Format as $1.250 USD (Latin American thousands separator). */
export function formatUSD(amount: number): string {
  const rounded = Math.round(amount);
  const formatted = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const sign = rounded < 0 ? "-" : "";
  return `${sign}$${formatted} USD`;
}

/** Argentine pesos: $1.313.250 */
export function formatARS(amount: number): string {
  const rounded = Math.round(amount);
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(rounded);
}

/** Price in list lines without $: "900 USD" (WhatsApp lists stay in USD). */
export function formatListPrice(amount: number): string {
  const rounded = Math.round(amount);
  const formatted = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${formatted} USD`;
}

/**
 * Presentation-only conversion. Business math stays in USD.
 * If ARS is requested without a rate, falls back to USD formatting.
 */
export function formatMoney(
  usdAmount: number,
  currency: CurrencyCode = "USD",
  usdToArs?: number | null,
): string {
  if (
    currency === "ARS" &&
    typeof usdToArs === "number" &&
    Number.isFinite(usdToArs) &&
    usdToArs > 0
  ) {
    return formatARS(convertUsdToArs(usdAmount, usdToArs));
  }
  return formatUSD(usdAmount);
}

export function formatCurrency(
  amount: number,
  currency: CurrencyCode = "USD",
  usdToArs?: number | null,
): string {
  return formatMoney(amount, currency, usdToArs);
}
