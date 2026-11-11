"use client";

import { useEffect, useRef, useState } from "react";
import { formatArs, formatCapacity, formatUsd } from "@/components/cotizador/format";
import { Card } from "@/components/cotizador/ui/card";
import { useWizard } from "@/components/cotizador/wizard-context";
import { DEMO_QUOTE_WARNING } from "@/lib/cotizador/demo-copy";
import { useCurrency } from "@/components/currency/currency-provider";

const CONFETTI_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#FFE66D",
  "#95E1D3",
  "#F38181",
  "#AA96DA",
  "#FCBAD3",
  "#A8D8EA",
  "#FF9F43",
  "#6BCB77",
];

const QUOTE_VALID_SECONDS = 24 * 60 * 60;

function formatCountdown(totalSeconds: number) {
  const safe = Math.max(0, totalSeconds);
  const hours = Math.floor(safe / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((safe % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (safe % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function QuoteTimer({ quoteKey }: { quoteKey: string }) {
  const [remaining, setRemaining] = useState(QUOTE_VALID_SECONDS);

  useEffect(() => {
    setRemaining(QUOTE_VALID_SECONDS);
    const startedAt = Date.now();
    const id = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      setRemaining(Math.max(0, QUOTE_VALID_SECONDS - elapsed));
    }, 250);
    return () => window.clearInterval(id);
  }, [quoteKey]);

  const expired = remaining <= 0;

  return (
    <div
      className="mb-4 flex items-center gap-3 rounded-2xl border px-3 py-3"
      style={{
        borderColor: "#E8C46A",
        background:
          "linear-gradient(90deg, #FBF3DF 0%, #FFFDF8 55%, #FFFFFF 100%)",
      }}
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: "#F4E6BF" }}
        aria-hidden
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="#D4A017"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p
          className="text-[11px] font-bold tracking-[0.14em] uppercase"
          style={{ color: "#D4A017" }}
        >
          {expired ? "Oferta vencida" : "Oferta bloqueada"}
        </p>
        {expired ? (
          <p className="mt-0.5 text-sm font-semibold text-neutral-800">
            Volvé a cotizar para bloquear un nuevo precio
          </p>
        ) : (
          <p className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5 text-neutral-900">
            <span className="text-xl font-bold tabular-nums tracking-tight">
              {formatCountdown(remaining)}
            </span>
            <span className="text-sm font-normal text-neutral-800">
              restantes
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

/** Demo-only WhatsApp link without a real phone number. */
const DEMO_WHATSAPP_HREF =
  "https://wa.me/?text=" +
  encodeURIComponent(
    "Hola, quiero continuar con mi cotización de Usados Premium.",
  );

function WhatsAppDemoButton() {
  return (
    <a
      href={DEMO_WHATSAPP_HREF}
      target="_blank"
      rel="noopener noreferrer"
      data-share-exclude
      className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#25D366]/25 transition-all hover:bg-[#1ebe57]"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
      Continuar por WhatsApp
    </a>
  );
}

function Confetti() {
  const [pieces] = useState(() =>
    Array.from({ length: 60 }, (_, id) => ({
      id,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 0.5}s`,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: Math.random() * 10 + 5,
      isRound: Math.random() > 0.5,
    })),
  );

  return (
    <div data-share-exclude className="animate-confetti-container pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="confetti-piece"
          style={{
            left: piece.left,
            animationDelay: piece.delay,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: piece.isRound ? "50%" : "0",
          }}
        />
      ))}
    </div>
  );
}

const screenshotModule = import("modern-screenshot");

async function createQuoteImage(): Promise<File | null> {
  const phone = document.querySelector("[data-quote-phone]");
  if (!(phone instanceof HTMLElement)) return null;
  const { domToBlob } = await screenshotModule;
  const blob = await domToBlob(phone, {
    type: "image/png",
    scale: 2,
    backgroundColor: "#ffffff",
    filter: (node) => !(node instanceof HTMLElement && node.dataset.shareExclude === "true"),
  });
  if (!blob || blob.size === 0) return null;
  return new File([blob], "cotizacion-usados-premium.png", { type: "image/png" });
}

export function StepResult() {
  const { state, quote, tradeOptions, pending, reset, chooseUpgrade } = useWizard();
  const { rate } = useCurrency();
  const fileRef = useRef<File | null>(null);
  const previewRef = useRef<string | null>(null);
  const [shareState, setShareState] = useState<"preparing" | "ready" | "saved" | "error">("preparing");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCheaper, setShowCheaper] = useState(false);
  const usdToArs = rate?.usdToArs ?? null;

  useEffect(() => {
    if (!quote) return;
    let cancelled = false;
    setShareState("preparing");
    fileRef.current = null;
    void createQuoteImage()
      .then((file) => {
        if (cancelled) return;
        if (!file) {
          setShareState("error");
          return;
        }
        fileRef.current = file;
        setShareState("ready");
      })
      .catch(() => {
        if (!cancelled) setShareState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [quote]);

  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  if (!quote || !state.model || !state.storage) {
    return (
      <Card>
        <div className="py-8 text-center">
          <p className="text-fg-muted">Error al calcular el precio</p>
          <button type="button" onClick={reset} className="mt-4 text-sm text-fg underline">
            Volver a empezar
          </button>
        </div>
      </Card>
    );
  }

  const canje = state.canjeMode && quote.target && quote.difference !== null;
  const difference = quote.difference ?? 0;
  const covers = canje && difference <= 0;
  const cheaper = canje
    ? tradeOptions
        .filter((option) => option.slug !== state.upgradeSlug)
        .map((option) => ({
          option,
          difference: option.salePrice - quote.finalPrice,
        }))
        .filter((item) => item.difference < difference)
        .sort((a, b) => a.difference - b.difference)
    : [];

  function showImagePreview(file: File) {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (!coarse) {
      downloadImage(file);
      setShareState("saved");
      return;
    }
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const url = URL.createObjectURL(file);
    previewRef.current = url;
    setPreviewUrl(url);
    setShareState("saved");
  }

  function closePreview() {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    previewRef.current = null;
    setPreviewUrl(null);
    setShareState("ready");
  }

  function shareQuoteImage() {
    const file = fileRef.current;
    if (!file) {
      if (shareState === "error") {
        setShareState("preparing");
        void createQuoteImage().then((next) => {
          if (!next) {
            setShareState("error");
            return;
          }
          fileRef.current = next;
          setShareState("ready");
        });
      }
      return;
    }
    if (canShareImage(file)) {
      void navigator
        .share({ files: [file], title: "Cotización Usados Premium" })
        .then(() => setShareState("ready"))
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          showImagePreview(file);
        });
      return;
    }
    showImagePreview(file);
  }

  return (
    <Card className="text-center">
      <Confetti />
      {canje && quote.target ? (
        <div className="mb-4 space-y-3 text-center">
          <div className="flex min-h-[5rem] flex-col justify-center rounded-xl border border-green-500/20 bg-green-500/10 p-4">
            <p className="text-xs text-green-700/70 dark:text-green-300/60">
              Tu {state.model} {formatCapacity(state.storage)} vale
            </p>
            <p className="mt-0.5 text-lg font-bold text-green-600 dark:text-green-400">
              {formatUsd(quote.finalPrice)}
            </p>
          </div>
          <div className="flex min-h-[5rem] flex-col justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
            <p className="text-xs text-blue-700/70 dark:text-blue-300/60">
              {quote.target.name} {formatCapacity(quote.target.storage)}
              {quote.target.batteryCondition != null
                ? ` · Batería ${quote.target.batteryCondition}%`
                : ""}
            </p>
            <p className="mt-0.5 text-lg font-bold text-blue-600 dark:text-blue-300">
              {formatUsd(quote.target.salePrice)}
            </p>
          </div>
          <div className="flex min-h-[5rem] flex-col justify-center rounded-xl border border-line bg-fg/[0.06] p-4 dark:bg-gradient-to-br dark:from-white/10 dark:to-white/5">
            <p className="text-xs text-fg-muted">
              {covers ? "Te queda a favor" : "Diferencia a pagar"}
            </p>
            <p className="animate-countUp mt-1 text-2xl font-black text-fg">
              {formatUsd(Math.abs(difference))}
            </p>
            {usdToArs !== null && Math.abs(difference) > 0 ? (
              <p className="mt-1 text-lg font-bold text-fg-muted">{formatArs(difference, usdToArs)}</p>
            ) : null}
          </div>
          <p className="text-xs italic text-fg-subtle">
            *Precio estimado sujeto a revisión física
          </p>
          {quote.demo ? <p className="text-xs text-fg-subtle">{DEMO_QUOTE_WARNING}</p> : null}
          {cheaper.length > 0 ? (
            <div className="space-y-2 text-left">
              <button
                type="button"
                onClick={() => setShowCheaper((open) => !open)}
                className="flex w-full items-center gap-3 rounded-2xl border border-green-500/30 bg-green-500/10 px-3 py-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-500/15 text-green-600 dark:text-green-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l5-5 4 4 7-8" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 7h6v6" />
                  </svg>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-fg">
                    ¿Querés pagar menos diferencia?
                  </span>
                  <span className="mt-0.5 block text-xs text-fg-muted">
                    {cheaper.length === 1
                      ? "Mirá 1 alternativa más accesible"
                      : `Mirá ${cheaper.length} alternativas más accesibles`}
                  </span>
                </span>
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`h-4 w-4 shrink-0 text-fg-subtle transition-transform ${showCheaper ? "rotate-180" : ""}`}
                >
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>
              {showCheaper
                ? cheaper.map((item) => {
                    const amount = item.difference;
                    const credit = amount <= 0;
                    return (
                      <button
                        key={item.option.slug}
                        type="button"
                        disabled={pending}
                        onClick={() => void chooseUpgrade(item.option.slug)}
                        className="flex w-full items-center gap-3 rounded-2xl border border-line bg-bg px-3 py-3 disabled:opacity-60"
                      >
                        {item.option.imageUrl ? (
                          <img
                            src={item.option.imageUrl}
                            alt=""
                            className="h-14 w-14 shrink-0 rounded-xl object-cover"
                          />
                        ) : (
                          <span className="h-14 w-14 shrink-0 rounded-xl bg-line/40" />
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold leading-tight text-fg">
                            {item.option.name}
                          </span>
                          <span className="mt-0.5 block text-xs text-fg-subtle">
                            {formatCapacity(item.option.storage)}
                          </span>
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="block text-[11px] text-fg-subtle">
                            {credit ? "Te queda a favor" : "Diferencia a pagar"}
                          </span>
                          <span className="block text-lg font-bold leading-tight text-green-600 dark:text-green-400">
                            {formatUsd(Math.abs(amount))}
                          </span>
                          {usdToArs !== null && amount !== 0 ? (
                            <span className="mt-0.5 block text-[11px] font-medium text-fg-subtle">
                              {formatArs(amount, usdToArs)}
                            </span>
                          ) : null}
                        </span>
                      </button>
                    );
                  })
                : null}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="sticky top-0 z-10 -mx-3 mb-4 border-b border-line bg-bg px-3 pt-6 pb-4 text-center shadow-[0_4px_12px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
          <p className="mb-1 text-sm text-fg-muted">
            Tu {state.model} de {formatCapacity(state.storage)} vale
          </p>
          <p className="animate-countUp text-3xl font-black tracking-tight text-fg sm:text-4xl">
            {formatUsd(quote.finalPrice)}
          </p>
          {usdToArs !== null ? (
            <p className="mt-1 text-xl font-bold text-fg-muted sm:text-2xl">
              {formatArs(quote.finalPrice, usdToArs)}
            </p>
          ) : null}
          <p className="mt-2 text-xs italic text-fg-subtle">
            *Precio estimado sujeto a revisión física
          </p>
          {quote.demo ? <p className="mt-1 text-xs text-fg-subtle">{DEMO_QUOTE_WARNING}</p> : null}
          {state.canjeMode && !quote.target ? (
            <p className="mt-3 text-xs text-fg-muted">
              El equipo elegido ya no está disponible para el canje. La toma de tu iPhone sigue siendo válida.
            </p>
          ) : null}
        </div>
      )}

      <QuoteTimer
        quoteKey={`${quote.finalPrice}-${state.model}-${state.storage}-${state.canjeMode ? state.upgradeSlug ?? "canje" : "sell"}`}
      />

      <DeductionList deductions={quote.deductions} />

      <WhatsAppDemoButton />

      <button
        type="button"
        data-share-exclude
        onClick={shareQuoteImage}
        disabled={shareState === "preparing"}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-line bg-surface px-4 py-3 text-sm font-semibold text-fg transition-all hover:border-accent/40 hover:bg-accent/5 disabled:opacity-70"
      >
        {shareState === "preparing"
          ? "Preparando imagen…"
          : shareState === "error"
            ? "Reintentar imagen"
            : "Compartir cotización"}
      </button>
      <p data-share-exclude className="mt-3 text-center text-xs text-fg-subtle">
        {previewUrl
          ? "Mantené presionada la imagen para enviarla. No enviamos estos datos."
          : shareState === "saved"
            ? "Se descargó la imagen. No enviamos estos datos."
            : shareState === "error"
              ? "No se pudo crear la imagen. Probá de nuevo."
              : "Se comparte una imagen del teléfono, tal como se ve. No enviamos estos datos."}
      </p>
      {previewUrl ? (
        <div
          data-share-exclude
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-4 sm:items-center"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-4 text-center text-neutral-900">
            <p className="text-sm font-semibold">Mantené presionada la imagen para compartirla</p>
            <img
              src={previewUrl}
              alt="Cotización Usados Premium"
              className="mt-3 max-h-[70vh] w-full rounded-xl object-contain"
            />
            <button
              type="button"
              onClick={closePreview}
              className="mt-3 text-sm text-neutral-600 underline"
            >
              Cerrar
            </button>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        data-share-exclude
        onClick={reset}
        className="mx-auto mt-4 flex items-center justify-center gap-1.5 text-xs text-fg-subtle underline decoration-fg/20 underline-offset-2 transition-colors hover:text-fg-muted hover:decoration-fg/40"
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Cotizar otro iPhone
      </button>
    </Card>
  );
}

function DeductionList({
  deductions,
}: {
  deductions: { label: string; amount: number }[];
}) {
  return (
    <div className="mb-4 rounded-xl border border-line bg-bg-subtle px-4 py-3 text-left">
      <p className="text-xs font-semibold tracking-wide text-fg-subtle">
        Penalizaciones descontadas
      </p>
      {deductions.length === 0 ? (
        <p className="mt-2 text-sm text-fg-muted">Sin penalizaciones.</p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {deductions.map((line) => (
            <li key={line.label} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-fg">{line.label}</span>
              <span className="shrink-0 font-semibold text-fg">−{formatUsd(line.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function canShareImage(file: File) {
  if (typeof navigator.canShare !== "function") return false;
  try {
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

function downloadImage(file: File) {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  link.click();
  URL.revokeObjectURL(url);
}
