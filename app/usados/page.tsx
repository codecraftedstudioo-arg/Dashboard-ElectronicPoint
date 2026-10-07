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

      <section className="relative overflow-hidden border-b border-black/5 bg-[#f4f6f8] text-[#111827]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_78%_18%,rgba(186,199,214,0.45),transparent_54%)]"
        />
        <div className="relative mx-auto grid w-full min-w-0 max-w-6xl grid-cols-1 items-center gap-8 px-4 py-14 sm:gap-10 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,48%)] lg:gap-x-12 lg:py-20">
          <div className="flex max-w-xl flex-col items-start text-left">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Usados premium
            </h1>
            <div className="mt-2 space-y-1">
              <p className="text-base text-[#6b7280] sm:text-lg">
                Equipos seleccionados, revisados y listos para vos.
              </p>
              <p className="text-base text-[#6b7280] sm:text-lg">
                Garantía de 30 días.
              </p>
            </div>
            <a
              href="#equipos"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-contrast transition-colors hover:bg-accent-hover"
            >
              Ver equipos disponibles
            </a>
            <p className="mt-4 flex min-w-0 items-center gap-2 text-base text-[#6b7280] sm:text-lg">
              <span
                aria-hidden
                className="h-2 w-2 shrink-0 rounded-full bg-[#34c759]"
              />
              <span className="min-w-0 leading-snug">{availableLabel}</span>
            </p>
          </div>
          <div className="mx-auto w-full min-w-0 max-w-[17.5rem] sm:max-w-sm md:max-w-md lg:mx-0 lg:max-w-none">
            <Image
              src="/catalog/hero-iphone-17-pro.png"
              alt=""
              width={1149}
              height={1169}
              priority
              unoptimized
              sizes="(max-width: 640px) 70vw, (max-width: 1024px) 28rem, 48vw"
              className="hero-phones h-auto w-full object-contain"
            />
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
