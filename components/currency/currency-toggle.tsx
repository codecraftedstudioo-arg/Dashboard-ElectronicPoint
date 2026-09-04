"use client";

import { useCurrency } from "@/components/currency/currency-provider";
import { cn } from "@/components/ui";
import type { CurrencyCode } from "@/lib/currency";
import {
  formatBlueRate,
  formatRateUpdatedAt,
} from "@/lib/exchange-rate";

export function CurrencyToggle({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
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
        className="inline-flex rounded-xl border border-card-border bg-card p-0.5 text-sm"
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
                "rounded-lg px-2.5 py-1.5 font-semibold transition-colors sm:px-3",
                active
                  ? "bg-accent text-accent-contrast"
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
