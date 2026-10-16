"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import Link from "next/link";
import { useCatalogSite } from "@/components/catalog/catalog-site-context";
import { useCurrency } from "@/components/currency/currency-provider";
import { DEMO_QUOTE_WARNING } from "@/lib/cotizador/demo-copy";
import type { TradeOption } from "@/lib/cotizador/types";
import { CotizadorTheme, ThemeToggle } from "@/components/cotizador/theme";
import { ProgressBar } from "@/components/cotizador/ui/progress-bar";
import { WizardProvider, useWizard, type ModelOption } from "@/components/cotizador/wizard-context";
import { StepBasics } from "@/components/cotizador/steps/step-basics";
import { StepCondition } from "@/components/cotizador/steps/step-condition";
import { StepDetails } from "@/components/cotizador/steps/step-details";
import { StepFunctionality } from "@/components/cotizador/steps/step-functionality";
import { StepResult } from "@/components/cotizador/steps/step-result";
import { StepUpgrade } from "@/components/cotizador/steps/step-upgrade";

const TOTAL_STEPS = 5;
const BRAND = "Usados Premium";

function IPhoneFrame({
  children,
  contentRef,
  showRate,
}: {
  children: ReactNode;
  contentRef?: RefObject<HTMLDivElement | null>;
  showRate?: boolean;
}) {
  const { rate } = useCurrency();
  const venta = rate?.usdToArs ?? null;
  const updated = rate?.updatedAt ? new Date(rate.updatedAt) : new Date();

  return (
    <div data-quote-phone className="relative mx-auto w-[300px] sm:w-[350px] md:w-[390px]">
      <div className="absolute inset-4 rounded-[50px] bg-black/40 blur-2xl" />
      <div
        className="relative rounded-[48px] p-[2px] sm:rounded-[52px]"
        style={{
          background:
            "linear-gradient(145deg, #5a5a5c 0%, #3d3d3f 15%, #252527 50%, #3d3d3f 85%, #5a5a5c 100%)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
      >
        <div className="rounded-[46px] bg-[#111] p-[8px] sm:rounded-[50px] sm:p-[10px]">
          <div className="relative flex h-[640px] flex-col overflow-hidden rounded-[38px] bg-bg sm:h-[700px] sm:rounded-[42px]">
            <div className="relative h-12 flex-shrink-0 sm:h-14">
              <div className="absolute top-3 left-5 text-[11px] font-semibold text-fg sm:text-xs">
                {new Date().toLocaleTimeString("es-AR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </div>
              <div className="absolute top-2 left-1/2 -translate-x-1/2 sm:top-2.5">
                <div
                  className="flex h-[26px] w-24 items-center justify-center gap-2 rounded-[20px] bg-black sm:h-[30px] sm:w-28"
                  style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.04)" }}
                >
                  <div className="flex h-[10px] w-[10px] items-center justify-center rounded-full bg-[#111]">
                    <div className="h-[6px] w-[6px] rounded-full bg-[#1a365d]/80" />
                  </div>
                  <div className="h-[8px] w-[8px] rounded-full bg-[#111]" />
                </div>
              </div>
              <div className="absolute top-3 right-5 flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-fg sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor">
                  <rect x="1" y="14" width="3" height="5" rx="0.5" />
                  <rect x="6" y="10" width="3" height="9" rx="0.5" />
                  <rect x="11" y="6" width="3" height="13" rx="0.5" />
                  <rect x="16" y="2" width="3" height="17" rx="0.5" />
                </svg>
                <div className="flex h-2.5 w-5 items-center rounded-sm border border-fg p-[1px]">
                  <div className="h-full w-3/4 rounded-[1px] bg-fg" />
                </div>
              </div>
            </div>

            <div className="flex flex-shrink-0 items-center gap-2 border-b border-line px-3 py-2">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] bg-fg/10 text-fg shadow-lg">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="h-5 w-5">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-fg">Usados premium</p>
                <p className="text-[10px] text-fg-subtle">Cotizador iPhone</p>
              </div>
              {showRate && venta !== null ? (
                <div className="flex-shrink-0 rounded-lg border border-fg/[0.08] bg-fg/[0.04] px-2.5 py-1.5 text-right">
                  <p className="text-[8px] leading-none tracking-wider text-fg-subtle uppercase">Dólar blue</p>
                  <p className="mt-0.5 text-[11px] font-semibold tracking-tight text-green-600 dark:text-green-400">
                    ${venta.toLocaleString("es-AR")}
                  </p>
                  <p className="mt-0.5 text-[9px] leading-none text-fg-subtle">
                    {updated.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false })}
                    {" · "}
                    {updated.toLocaleDateString("es-AR")}
                  </p>
                </div>
              ) : null}
            </div>

            <div ref={contentRef} className="scrollbar-thin flex-1 overflow-x-hidden overflow-y-auto px-4 pt-2 sm:px-5">
              {children}
            </div>
            <div className="flex flex-shrink-0 justify-center py-2">
              <div className="h-[5px] w-28 rounded-full bg-fg/30 sm:w-32" />
            </div>
          </div>
        </div>
      </div>

      <div className="hidden sm:block">
        <div className="absolute top-[17%] -left-[3px] h-7 w-[4px] rounded-l-sm bg-gradient-to-r from-[#4a4a4c] to-[#3a3a3c]" />
        <div className="absolute top-[25%] -left-[3px] h-11 w-[4px] rounded-l-sm bg-gradient-to-r from-[#4a4a4c] to-[#3a3a3c]" />
        <div className="absolute top-[37%] -left-[3px] h-11 w-[4px] rounded-l-sm bg-gradient-to-r from-[#4a4a4c] to-[#3a3a3c]" />
        <div className="absolute top-[26%] -right-[3px] h-14 w-[4px] rounded-r-sm bg-gradient-to-l from-[#4a4a4c] to-[#3a3a3c]" />
      </div>
    </div>
  );
}

function useCounter(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);
  return count;
}

function SideInfo({ position }: { position: "left" | "right" }) {
  const clientCount = useCounter(2000, 1500);
  if (position === "left") {
    return (
      <div className="hidden flex-col gap-4 pr-8 text-right lg:flex">
        <InfoItem title="Cotización instantánea" detail="Resultado en 1 minuto" tone="green" align="end" icon="bolt" />
        <InfoItem title="Mejor precio" detail="Garantizado del mercado" tone="blue" align="end" icon="price" />
        <InfoItem title="Pago inmediato" detail="Efectivo o transferencia" tone="purple" align="end" icon="cash" />
      </div>
    );
  }
  return (
    <div className="hidden flex-col gap-4 pl-8 text-left lg:flex">
      <InfoItem title="100% Seguro" detail="Visitá nuestro local" tone="amber" icon="shield" />
      <InfoItem title="Soporte WhatsApp" detail="Respondemos en minutos" tone="cyan" icon="chat" />
      <InfoItem title={`+${clientCount} clientes`} detail="Confían en nosotros" tone="rose" icon="heart" />
    </div>
  );
}

function InfoItem({
  title,
  detail,
  tone,
  align = "start",
  icon,
}: {
  title: string;
  detail: string;
  tone: "green" | "blue" | "purple" | "amber" | "cyan" | "rose";
  align?: "start" | "end";
  icon: "bolt" | "price" | "cash" | "shield" | "chat" | "heart";
}) {
  const tones = {
    green: "bg-green-500/20 text-green-600 dark:text-green-400",
    blue: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
    purple: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
    amber: "bg-amber-500/20 text-amber-600 dark:text-amber-400",
    cyan: "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400",
    rose: "bg-rose-500/20 text-rose-600 dark:text-rose-400",
  };
  const bubble = (
    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${tones[tone]}`}>
      <SideIcon name={icon} />
    </div>
  );
  return (
    <div className="space-y-1">
      <div className={`flex items-center gap-2 ${align === "end" ? "justify-end" : ""}`}>
        {align === "end" ? <span className="text-sm font-medium text-fg-muted">{title}</span> : null}
        {bubble}
        {align === "start" ? <span className="text-sm font-medium text-fg-muted">{title}</span> : null}
      </div>
      <p className={`text-xs text-fg-subtle ${align === "start" ? "pl-10" : ""}`}>{detail}</p>
    </div>
  );
}

function SideIcon({ name }: { name: "bolt" | "price" | "cash" | "shield" | "chat" | "heart" }) {
  const common = { className: "h-4 w-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" };
  if (name === "bolt") {
    return (
      <svg {...common}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    );
  }
  if (name === "price") {
    return (
      <svg {...common}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  if (name === "cash") {
    return (
      <svg {...common}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    );
  }
  if (name === "shield") {
    return (
      <svg {...common}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    );
  }
  if (name === "chat") {
    return (
      <svg {...common}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    );
  }
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function WizardScreen() {
  const { state, prevStep, reset, demoPricing } = useWizard();
  const { homePath } = useCatalogSite();
  const contentRef = useRef<HTMLDivElement>(null);
  const { currentStep, canjeMode } = state;

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  const showProgress = (currentStep > 1 || (currentStep === 1 && canjeMode)) && currentStep <= TOTAL_STEPS;
  const displayStep = canjeMode ? currentStep : currentStep - 1;
  const displayTotal = canjeMode ? TOTAL_STEPS : TOTAL_STEPS - 1;

  const step = (() => {
    switch (currentStep) {
      case 1:
        return <StepUpgrade />;
      case 2:
        return <StepBasics />;
      case 3:
        return <StepCondition />;
      case 4:
        return <StepDetails />;
      case 5:
        return <StepFunctionality />;
      case 6:
        return <StepResult />;
      default:
        return <StepUpgrade />;
    }
  })();

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg dark:bg-gradient-to-br dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative z-10 flex min-h-screen flex-col">
        <nav className="sticky top-0 z-50 border-b border-line bg-bg/95 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-w-0 items-center gap-1 text-[15px] font-semibold tracking-tight text-fg transition-colors hover:text-accent sm:gap-2 sm:text-xl lg:text-[1.35rem]"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
                className="h-5 w-5 shrink-0 sm:h-6 sm:w-6 lg:h-7 lg:w-7"
              >
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <span className="truncate">Usados premium</span>
            </button>
            <div className="flex items-center gap-4">
              <Link href={homePath} className="flex items-center gap-1 text-sm text-fg-muted transition-colors hover:text-fg">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Inicio
              </Link>
              {showProgress ? (
                <span className="text-sm font-medium text-fg-subtle">
                  Paso {displayStep}/{displayTotal}
                </span>
              ) : null}
              <ThemeToggle />
            </div>
          </div>
        </nav>

        <div className="border-b border-line bg-bg-subtle">
          <div className="mx-auto max-w-6xl space-y-1 px-4 py-3 text-center text-sm text-fg-muted">
            <p>Cotizamos en ARS y USD</p>
            {demoPricing ? (
              <p className="text-xs text-amber-700 dark:text-amber-300">{DEMO_QUOTE_WARNING}</p>
            ) : null}
          </div>
        </div>

        <main className="flex flex-1 items-center justify-center px-4 py-4">
          <div className="flex items-center justify-center gap-6 xl:gap-12">
            <SideInfo position="left" />
            <div className="flex-shrink-0">
              <IPhoneFrame contentRef={contentRef} showRate={currentStep === 6}>
                {showProgress ? (
                  <div className="mb-2">
                    <ProgressBar currentStep={displayStep} totalSteps={displayTotal} />
                  </div>
                ) : null}
                <div>{step}</div>
                {showProgress ? (
                  <div className="mt-4 flex items-center justify-between border-t border-line px-1 pt-3">
                    {currentStep > 1 ? (
                      <button type="button" onClick={prevStep} className="flex items-center gap-1 text-sm text-fg-muted transition-colors hover:text-fg">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Atrás
                      </button>
                    ) : (
                      <div className="w-14" />
                    )}
                    <span className="text-xs text-fg-subtle">
                      {displayStep} de {displayTotal}
                    </span>
                    <div className="w-14" />
                  </div>
                ) : null}
              </IPhoneFrame>

              <div className="mt-4 flex justify-center gap-4 lg:hidden">
                <span className="flex items-center gap-1.5 text-xs text-fg-muted">
                  <CheckBadge /> Pago inmediato
                </span>
                <span className="flex items-center gap-1.5 text-xs text-fg-muted">
                  <CheckBadge /> Mejor precio
                </span>
              </div>
            </div>
            <SideInfo position="right" />
          </div>
        </main>

        <footer className="space-y-1 py-4 text-center">
          <p className="text-xs text-fg-subtle">
            © {new Date().getFullYear()} {BRAND} · Visitá nuestro local
          </p>
          <p
            className="text-[11px] font-medium tracking-wide text-fg-subtle/45"
            aria-label="Desarrollado por CodeCraftedStudio"
          >
            CodeCraftedStudio
          </p>
        </footer>
      </div>
    </div>
  );
}

function CheckBadge() {
  return (
    <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );
}

export function QuoteExperience({
  models,
  tradeOptions,
  initialSlug,
  demoPricing = true,
}: {
  models: ModelOption[];
  tradeOptions: TradeOption[];
  initialSlug?: string;
  demoPricing?: boolean;
}) {
  return (
    <CotizadorTheme>
      <WizardProvider
        models={models}
        tradeOptions={tradeOptions}
        initialSlug={initialSlug}
        demoPricing={demoPricing}
      >
        <WizardScreen />
      </WizardProvider>
    </CotizadorTheme>
  );
}
