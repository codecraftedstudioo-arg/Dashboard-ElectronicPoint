export type CurrencyCode = "USD";

export const DEFAULT_CURRENCY: CurrencyCode = "USD";

export const CURRENCIES: Record<
  CurrencyCode,
  { code: CurrencyCode; label: string; symbol: string }
> = {
  USD: { code: "USD", label: "Dólar estadounidense", symbol: "$" },
};

/** Format as $1.250 USD (Latin American thousands separator). */
export function formatUSD(amount: number): string {
  const rounded = Math.round(amount);
  const formatted = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const sign = rounded < 0 ? "-" : "";
  return `${sign}$${formatted} USD`;
}

/** Price in list lines without $: "900 USD" */
export function formatListPrice(amount: number): string {
  const rounded = Math.round(amount);
  const formatted = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${formatted} USD`;
}

export function formatCurrency(amount: number, currency: CurrencyCode = "USD"): string {
  if (currency === "USD") return formatUSD(amount);
  return formatUSD(amount);
}
