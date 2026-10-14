"use client";

import { useEffect, useState } from "react";

type InstallmentOption = {
  installments: number;
  installmentAmount: number;
  totalAmount: number;
  interestFree: boolean;
};

function formatArsAmount(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}

export function MercadoPagoCheckout({ productId }: { productId: string }) {
  const [options, setOptions] = useState<InstallmentOption[] | null>(null);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(
          `/api/mercadopago/installments?productId=${encodeURIComponent(productId)}`,
        );
        if (!response.ok) return;
        const data = (await response.json()) as {
          ok?: boolean;
          options?: InstallmentOption[];
        };
        if (!cancelled && data.ok && data.options) {
          setOptions(data.options);
        }
      } catch {
        if (!cancelled) setOptions(null);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (!options) return null;

  async function pay() {
    setPaying(true);
    setError(null);
    try {
      const response = await fetch("/api/mercadopago/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        initPoint?: string;
      };
      if (!response.ok || !data.initPoint) {
        setError("No se pudo abrir el pago. Intentá de nuevo.");
        setPaying(false);
        return;
      }
      window.location.href = data.initPoint;
    } catch {
      setError("No se pudo abrir el pago. Intentá de nuevo.");
      setPaying(false);
    }
  }

  return (
    <div className="w-full min-w-0 max-w-full rounded-2xl border border-card-border bg-card p-4">
      {options.length ? (
        <ul className="space-y-2">
          {options.map((option) => (
            <li
              key={option.installments}
              className="flex min-w-0 items-baseline justify-between gap-3 text-sm"
            >
              <span className="min-w-0 text-foreground">
                {option.installments} cuotas de{" "}
                {formatArsAmount(option.installmentAmount)}
              </span>
              {option.interestFree ? (
                <span className="shrink-0 text-xs font-medium text-emerald-500">
                  sin interés
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">Pagá con Mercado Pago</p>
      )}
      <button
        type="button"
        onClick={() => void pay()}
        disabled={paying}
        className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[#009ee3] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#008dcc] disabled:opacity-60"
      >
        {paying ? "Abriendo Mercado Pago…" : "Pagar con Mercado Pago"}
      </button>
      {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
    </div>
  );
}
