import Image from "next/image";
import {
  CatalogFooter,
  CatalogHeader,
} from "@/components/catalog/catalog-chrome";
import { CatalogGrid } from "@/components/catalog/catalog-grid";
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
      ? "1 equipo disponible ahora"
      : `${availableCount} equipos disponibles ahora`;

  return (
    <div className="min-h-screen w-full min-w-0 bg-background text-foreground">
      <CatalogHeader />

      <section className="relative overflow-hidden border-b border-card-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_color-mix(in_srgb,var(--accent)_18%,transparent),_transparent_55%)]"
        />
        <div className="relative mx-auto grid w-full min-w-0 max-w-6xl grid-cols-1 gap-8 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,36rem)_420px] lg:items-end lg:justify-between lg:gap-x-8">
          <div className="flex max-w-xl flex-col items-start text-left">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Usados premium
            </h1>
            <div className="mt-2 space-y-1">
              <p className="text-base text-muted sm:text-lg">
                Equipos seleccionados, revisados y listos para vos.
              </p>
              <p className="text-base text-muted sm:text-lg">
                Garantía de 30 días.
              </p>
            </div>
            <a
              href="#equipos"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-contrast transition-colors hover:bg-accent-hover"
            >
              Ver equipos disponibles
            </a>
            <p className="mt-4 flex min-w-0 items-center gap-2 text-base text-muted sm:text-lg">
              <span
                aria-hidden
                className="h-2 w-2 shrink-0 rounded-full bg-[#34c759]"
              />
              <span className="min-w-0 leading-snug">{availableLabel}</span>
            </p>
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
