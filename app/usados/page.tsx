import {
  CatalogFooter,
  CatalogHeader,
} from "@/components/catalog/catalog-chrome";
import { CatalogHero } from "@/components/catalog/catalog-hero";
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

      <CatalogHero availableLabel={availableLabel} />

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
