import Image from "next/image";
import {
  CatalogFooter,
  CatalogHeader,
} from "@/components/catalog/catalog-chrome";
import { CatalogGrid } from "@/components/catalog/catalog-grid";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { getPublishedIphones } from "@/lib/public-catalog";
import { catalogMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = catalogMetadata();

export default async function UsadosPage() {
  const products = await getPublishedIphones();
  const availableCount = products.length;
  const availableLabel =
    availableCount === 1
      ? "1 equipo disponible"
      : `${availableCount} equipos disponibles`;

  return (
    <div className="min-h-screen w-full min-w-0 bg-background text-foreground">
      <CatalogHeader />

      <section className="relative overflow-hidden border-b border-card-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_color-mix(in_srgb,var(--accent)_18%,transparent),_transparent_55%)]"
        />
        <div className="relative mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-8 px-4 py-16 sm:px-6 sm:py-24 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Usados premium
            </h1>
            <div className="space-y-1">
              <p className="text-base text-muted sm:text-lg">
                Equipos seleccionados, revisados y listos para vos.
              </p>
              <p className="text-base text-muted sm:text-lg">
                Garantía de 30 días.
              </p>
            </div>
            <div className="flex w-full justify-center">
              <div className="inline-flex min-w-[220px] flex-col items-stretch gap-3">
                <a
                  href="#equipos"
                  className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-contrast transition-colors hover:bg-accent-hover"
                >
                  Ver equipos disponibles
                </a>
                <LiquidButton href="#equipos" size="cta" className="w-full">
                  {availableLabel}
                </LiquidButton>
              </div>
            </div>
          </div>
          <div
            aria-hidden
            className="grid w-full min-w-0 max-w-md grid-cols-2 gap-3 lg:w-[420px]"
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-input ring-1 ring-card-border">
              <Image
                src="/catalog/hero-iphone-pro.jpg"
                alt=""
                fill
                priority
                sizes="(max-width: 1024px) 45vw, 210px"
                className="object-cover"
              />
            </div>
            <div className="relative mt-8 aspect-[3/4] overflow-hidden rounded-3xl bg-input ring-1 ring-card-border">
              <Image
                src="/catalog/hero-iphone.jpg"
                alt=""
                fill
                priority
                sizes="(max-width: 1024px) 45vw, 210px"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section
        id="equipos"
        className="mx-auto w-full min-w-0 max-w-6xl scroll-mt-20 px-4 py-8 sm:scroll-mt-24 sm:px-6 sm:py-10"
      >
        <CatalogGrid products={products} />
      </section>

      <CatalogFooter />
    </div>
  );
}
