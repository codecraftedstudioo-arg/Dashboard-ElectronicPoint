"use client";

import { useCurrency } from "@/components/currency/currency-provider";
import { cn } from "@/components/ui";
import { formatUSD, type CurrencyCode } from "@/lib/currency";
import {
  convertUsdToArs,
  formatBlueRate,
  formatRateUpdatedAt,
} from "@/lib/exchange-rate";

export function CurrencyToggle({
  className,
  compact = false,
  tone = "default",
}: {
  className?: string;
  compact?: boolean;
  tone?: "default" | "onDark";
}) {
  const { currency, setCurrency, canShowArs, rateError } = useCurrency();

  function select(next: CurrencyCode) {
    if (next === "ARS" && !canShowArs) return;
    setCurrency(next);
  }

  return (
    <div className={cn("flex flex-col items-end gap-1", className)}>
      <div
        role="group"
        aria-label="Moneda"
        className={cn(
          "inline-flex rounded-full p-1 text-sm",
          tone === "onDark"
            ? "border border-white/10 bg-white/10"
            : "border border-card-border bg-card",
        )}
      >
        {(["USD", "ARS"] as const).map((code) => {
          const active = currency === code;
          const disabled = code === "ARS" && !canShowArs;
          return (
            <button
              key={code}
              type="button"
              disabled={disabled}
              onClick={() => select(code)}
              className={cn(
                "rounded-full px-3 py-1.5 font-semibold transition-colors",
                active
                  ? tone === "onDark"
                    ? "bg-white text-[#101816]"
                    : "bg-accent text-accent-contrast"
                  : tone === "onDark"
                    ? "text-white/70 hover:text-white"
                    : "text-muted hover:bg-hover hover:text-foreground",
                disabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
              )}
              title={
                disabled
                  ? "No se pudo actualizar la cotización"
                  : code === "USD"
                    ? "Mostrar precios en dólares"
                    : "Mostrar precios en pesos"
              }
            >
              {code}
            </button>
          );
        })}
      </div>
      {!compact && currency === "ARS" && rateError ? (
        <p className="max-w-[14rem] text-right text-[11px] text-muted">
          {rateError}
        </p>
      ) : null}
    </div>
  );
}

export function ExchangeRateBadge({ className }: { className?: string }) {
  const { currency, rate, rateError } = useCurrency();

  if (currency !== "ARS") return null;

  if (!rate) {
    return (
      <p className={cn("text-xs text-muted", className)}>
        {rateError || "No se pudo actualizar la cotización"}
      </p>
    );
  }

  const updated = formatRateUpdatedAt(rate.updatedAt);

  return (
    <p className={cn("text-xs text-muted", className)}>
      Dólar blue venta {formatBlueRate(rate.usdToArs)}
      {updated ? ` · actualizado ${updated}` : ""}
      {rate.stale || rateError ? " · última cotización disponible" : ""}
    </p>
  );
}

export function Money({
  amount,
  className,
}: {
  amount: number;
  className?: string;
}) {
  const { format } = useCurrency();
  return <span className={className}>{format(amount)}</span>;
}

/** Always show USD primary + ARS secondary when blue venta rate is available. */
export function DualPrice({
  amount,
  className,
  usdClassName,
  arsClassName,
}: {
  amount: number;
  className?: string;
  usdClassName?: string;
  arsClassName?: string;
}) {
  const { rate, canShowArs } = useCurrency();

  const arsDisplay =
    canShowArs && rate
      ? (() => {
          const ars = Math.round(convertUsdToArs(amount, rate.usdToArs));
          const formatted = Math.abs(ars)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
          const sign = ars < 0 ? "-" : "";
          return `${sign}$${formatted} ARS`;
        })()
      : null;

  return (
    <div className={cn("min-w-0", className)}>
      <p
        className={cn(
          "truncate font-semibold tracking-tight text-foreground",
          usdClassName,
        )}
      >
        {formatUSD(amount)}
      </p>
      {arsDisplay ? (
        <p
          className={cn(
            "mt-0.5 truncate font-medium leading-snug text-muted",
            arsClassName,
          )}
        >
          {arsDisplay}
        </p>
      ) : null}
    </div>
  );
}
