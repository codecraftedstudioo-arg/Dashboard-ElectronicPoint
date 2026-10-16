"use client";

import { useState } from "react";
import { useCurrency } from "@/components/currency/currency-provider";
import { getColorName, colorMap } from "@/components/cotizador/colors";
import { formatArs, formatCapacity, formatUsd } from "@/components/cotizador/format";
import { Button } from "@/components/cotizador/ui/button";
import { Card, CardHeader } from "@/components/cotizador/ui/card";
import { Select } from "@/components/cotizador/ui/select";
import { StoragePill } from "@/components/cotizador/ui/selection-card";
import { useWizard } from "@/components/cotizador/wizard-context";

export function StepUpgrade() {
  const {
    state,
    tradeOptions,
    initialSlug,
    setCanjeMode,
    setUpgradeSlug,
    clearUpgrade,
    nextStep,
  } = useWizard();
  const { rate } = useCurrency();
  const usdToArs = rate?.usdToArs ?? null;
  const preset = tradeOptions.find((option) => option.slug === state.upgradeSlug);
  const [wantsUpgrade, setWantsUpgrade] = useState(() => state.upgradeSlug !== null);
  const [modelName, setModelName] = useState<string | null>(preset?.name ?? null);
  const [storage, setStorage] = useState<string | null>(preset?.storage ?? null);

  const selected =
    tradeOptions.find(
      (option) =>
        option.slug === state.upgradeSlug &&
        option.name === modelName &&
        option.storage === storage,
    ) ?? null;
  const modelNames = [...new Set(tradeOptions.map((option) => option.name))];
  const storages = modelName
    ? [...new Set(tradeOptions.filter((option) => option.name === modelName).map((option) => option.storage))]
    : [];
  const colors =
    modelName && storage
      ? tradeOptions.filter((option) => option.name === modelName && option.storage === storage)
      : [];

  function handleJustSell() {
    setCanjeMode(false);
    clearUpgrade();
    nextStep();
  }

  function handleWantsUpgrade() {
    setCanjeMode(true);
    setWantsUpgrade(true);
    if (!state.upgradeSlug && initialSlug) {
      const option = tradeOptions.find((item) => item.slug === initialSlug);
      if (option) {
        setModelName(option.name);
        setStorage(option.storage);
        setUpgradeSlug(option.slug);
      }
    }
  }

  return (
    <Card>
      {!wantsUpgrade ? (
        <>
          <CardHeader title="¿Qué querés hacer?" />
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleWantsUpgrade}
              className="group relative min-h-20 w-full rounded-xl bg-accent p-4 text-left shadow-lg shadow-accent/30 transition-all hover:bg-accent-hover dark:border-2 dark:border-green-500 dark:bg-green-500/15 dark:shadow-[0_0_25px_-8px_rgba(34,197,94,0.5)] dark:hover:bg-green-500/25"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/20 dark:bg-green-500/30">
                  <svg className="h-5 w-5 text-white dark:text-green-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M21 12a9 9 0 0 0-15-6.7L3 8" />
                    <path d="M3 3v5h5" />
                    <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7" />
                    <path d="M16 16h5v5" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">Plan Canje</p>
                  <p className="mt-0.5 text-xs text-white/80 dark:text-white/60">
                    Usá tu iPhone como parte de pago
                  </p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={handleJustSell}
              className="group min-h-20 w-full rounded-xl border-2 border-line bg-surface p-4 text-left transition-all hover:border-accent/50 hover:bg-accent/5 dark:bg-white/5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10 dark:bg-green-500/20">
                  <svg className="h-5 w-5 text-accent dark:text-green-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-fg transition-colors group-hover:text-accent dark:group-hover:text-green-300">
                    Solo quiero vender
                  </p>
                  <p className="mt-0.5 text-xs text-fg-subtle">Ver mi cotización directamente</p>
                </div>
              </div>
            </button>
          </div>
        </>
      ) : (
        <div className="animate-fadeSlideIn space-y-4">
          <button
            type="button"
            onClick={() => {
              setCanjeMode(false);
              setWantsUpgrade(false);
              setModelName(null);
              setStorage(null);
              clearUpgrade();
            }}
            className="flex items-center gap-1 text-sm text-fg-subtle transition-colors hover:text-fg-muted"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>

          <CardHeader title="¿Qué iPhone querés?" />

          {tradeOptions.length === 0 ? (
            <div className="space-y-3 rounded-xl border border-line bg-bg-subtle p-4 text-center dark:bg-white/5">
              <p className="text-sm font-medium text-fg">Catálogo de canje no disponible</p>
              <p className="text-xs text-fg-muted">
                No hay equipos publicados para entregar como parte de pago.
              </p>
              <button
                type="button"
                onClick={handleJustSell}
                className="text-xs text-fg-subtle underline hover:text-fg-muted"
              >
                Continuar solo vendiendo
              </button>
            </div>
          ) : (
            <Select
              label="Modelo"
              placeholder="Elegí un modelo"
              options={modelNames.map((name) => ({ value: name, label: name }))}
              value={modelName ?? undefined}
              onChange={(name) => {
                setModelName(name);
                setStorage(null);
                setUpgradeSlug(null);
              }}
            />
          )}

          {modelName && storages.length > 0 ? (
            <div className="animate-fadeSlideIn space-y-2">
              <p className="text-sm font-medium text-fg-muted">Capacidad</p>
              <div className="flex flex-wrap gap-2">
                {storages.map((item) => (
                  <StoragePill
                    key={item}
                    value={item}
                    selected={storage === item}
                    onClick={() => {
                      setStorage(item);
                      setUpgradeSlug(null);
                    }}
                  />
                ))}
              </div>
            </div>
          ) : null}

          {storage && colors.length > 0 ? (
            <div className="animate-fadeSlideIn space-y-2">
              <p className="text-sm font-medium text-fg-muted">Color</p>
              <div className="flex flex-wrap gap-2">
                {colors.map((option) => (
                  <button
                    key={option.slug}
                    type="button"
                    onClick={() => setUpgradeSlug(option.slug)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-2 py-2 text-left text-sm transition-all ${
                      state.upgradeSlug === option.slug
                        ? "border-accent bg-accent/10 text-fg"
                        : "border-line bg-surface text-fg-muted hover:border-line-strong dark:bg-white/5"
                    }`}
                  >
                    <TradeThumb
                      url={option.imageUrl}
                      alt={`${option.name} ${formatCapacity(option.storage)} ${getColorName(option.color)}`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span
                          className="h-4 w-4 flex-shrink-0 rounded-full border border-line-strong"
                          style={{ backgroundColor: colorMap[option.color] || "#888" }}
                        />
                        {getColorName(option.color)}
                      </span>
                      {option.batteryCondition != null ? (
                        <span className="mt-0.5 block text-xs text-fg-subtle">
                          Batería {option.batteryCondition}%
                        </span>
                      ) : null}
                    </span>
                    <TradePrice usd={option.salePrice} usdToArs={usdToArs} />
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {selected ? (
            <div className="animate-fadeSlideIn flex items-center gap-3 rounded-xl border border-line bg-bg-subtle p-3 text-left dark:bg-white/5">
              <TradeThumb
                url={selected.imageUrl}
                alt={`${selected.name} ${formatCapacity(selected.storage)} ${getColorName(selected.color)}`}
                large
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-fg-muted">
                  {selected.name} {formatCapacity(selected.storage)} · {getColorName(selected.color)}
                </p>
                {selected.batteryCondition != null ? (
                  <p className="mt-0.5 text-xs text-fg-subtle">Batería {selected.batteryCondition}%</p>
                ) : null}
              </div>
              <TradePrice usd={selected.salePrice} usdToArs={usdToArs} large />
            </div>
          ) : null}

          {selected ? (
            <div className="pt-2">
              <Button onClick={nextStep} fullWidth>
                Continuar
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </Card>
  );
}

function TradePrice({
  usd,
  usdToArs,
  large = false,
}: {
  usd: number;
  usdToArs: number | null;
  large?: boolean;
}) {
  return (
    <span className="shrink-0 text-right">
      <span className={large ? "block text-base font-bold text-fg" : "block text-sm font-semibold text-fg"}>
        {formatUsd(usd)}
      </span>
      {usdToArs !== null ? (
        <span className="mt-0.5 block text-[11px] font-medium leading-tight text-fg-subtle">
          {formatArs(usd, usdToArs)}
        </span>
      ) : null}
    </span>
  );
}

function TradeThumb({
  url,
  alt,
  large = false,
}: {
  url: string | null;
  alt: string;
  large?: boolean;
}) {
  const size = large ? "h-16 w-16" : "h-12 w-12";
  if (!url) {
    return <span className={`${size} flex-shrink-0 rounded-lg bg-line/40`} aria-hidden />;
  }
  return (
    <img
      src={url}
      alt={alt}
      className={`${size} flex-shrink-0 rounded-lg object-cover`}
    />
  );
}
