"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  CURRENCY_COOKIE,
  CURRENCY_STORAGE_KEY,
  DEFAULT_CURRENCY,
  formatMoney,
  parseCurrency,
  type CurrencyCode,
} from "@/lib/currency";
import type { BlueVentaRate } from "@/lib/exchange-rate";

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  rate: BlueVentaRate | null;
  rateError: string | null;
  format: (usdAmount: number) => string;
  canShowArs: boolean;
};

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: DEFAULT_CURRENCY,
  setCurrency: () => {},
  rate: null,
  rateError: null,
  format: (amount) => formatMoney(amount, "USD"),
  canShowArs: false,
});

function persistCurrency(currency: CurrencyCode) {
  window.localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
  document.cookie = `${CURRENCY_COOKIE}=${currency}; path=/; max-age=31536000; SameSite=Lax`;
}

export function CurrencyProvider({
  children,
  initialCurrency = DEFAULT_CURRENCY,
  initialRate = null,
}: {
  children: ReactNode;
  initialCurrency?: CurrencyCode;
  initialRate?: BlueVentaRate | null;
}) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(initialCurrency);
  const [rate, setRate] = useState<BlueVentaRate | null>(initialRate);
  const [rateError, setRateError] = useState<string | null>(
    initialRate ? null : "No se pudo actualizar la cotización",
  );

  useEffect(() => {
    const stored = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
    const next = parseCurrency(stored ?? initialCurrency);
    setCurrencyState(next);
    persistCurrency(next);
  }, [initialCurrency]);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      try {
        const response = await fetch("/api/exchange-rate", {
          cache: "no-store",
        });
        const data = (await response.json()) as {
          ok?: boolean;
          rate?: BlueVentaRate;
          message?: string;
        };
        if (cancelled) return;
        if (data.ok && data.rate) {
          setRate(data.rate);
          setRateError(
            data.rate.stale ? "Última cotización disponible" : null,
          );
          return;
        }
        if (!rate) {
          setRateError(data.message || "No se pudo actualizar la cotización");
        } else {
          setRateError("Última cotización disponible");
        }
      } catch {
        if (cancelled) return;
        setRateError(
          rate
            ? "Última cotización disponible"
            : "No se pudo actualizar la cotización",
        );
      }
    }

    void refresh();
    const id = window.setInterval(refresh, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
    // Only mount-time refresh; rate identity intentionally omitted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setCurrency = useCallback((next: CurrencyCode) => {
    setCurrencyState(next);
    persistCurrency(next);
  }, []);

  const canShowArs = Boolean(
    rate && Number.isFinite(rate.usdToArs) && rate.usdToArs > 0,
  );

  const effectiveCurrency: CurrencyCode =
    currency === "ARS" && !canShowArs ? "USD" : currency;

  const value = useMemo<CurrencyContextValue>(
    () => ({
      currency: effectiveCurrency,
      setCurrency,
      rate,
      rateError:
        currency === "ARS" && !canShowArs
          ? rateError || "No se pudo actualizar la cotización"
          : currency === "ARS"
            ? rateError
            : null,
      canShowArs,
      format: (usdAmount: number) =>
        formatMoney(usdAmount, effectiveCurrency, rate?.usdToArs),
    }),
    [
      canShowArs,
      currency,
      effectiveCurrency,
      rate,
      rateError,
      setCurrency,
    ],
  );

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
