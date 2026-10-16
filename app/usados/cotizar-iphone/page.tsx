import "@/app/cotizador.css";
import { QuoteExperience } from "@/components/cotizador/wizard-page";
import { listQuoteModels } from "@/lib/cotizador/pricing-engine";
import { loadActiveQuoteConfig } from "@/lib/cotizador/pricing-source";
import { listEligibleTradeOptions, resolveTradeTarget } from "@/lib/cotizador/trade-target";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const active = await loadActiveQuoteConfig();
  return {
    title: "Cotizar iPhone — Usados premium",
    description: active.demo
      ? "Estimá el valor de demostración de tu iPhone para entregarlo como parte de pago."
      : "Estimá el valor de tu iPhone para entregarlo como parte de pago.",
    robots: { index: false, follow: false },
  };
}

export default async function CotizarIphonePage({
  searchParams,
}: {
  searchParams: Promise<{ equipo?: string }>;
}) {
  const { equipo } = await searchParams;
  const requested = typeof equipo === "string" ? equipo : undefined;
  const [active, target, tradeOptions] = await Promise.all([
    loadActiveQuoteConfig(),
    resolveTradeTarget(requested),
    listEligibleTradeOptions(),
  ]);

  return (
    <QuoteExperience
      models={listQuoteModels()}
      tradeOptions={tradeOptions}
      initialSlug={target ? requested : undefined}
      demoPricing={active.demo}
    />
  );
}
