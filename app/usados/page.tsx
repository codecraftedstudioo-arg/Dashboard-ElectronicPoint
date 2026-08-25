import {
  CatalogFooter,
  CatalogHeader,
} from "@/components/catalog/catalog-chrome";
import { CatalogGrid } from "@/components/catalog/catalog-grid";
import {
  getPublishedIphones,
  getPublishedModelNames,
} from "@/lib/public-catalog";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "iPhones usados — Electronic Point",
  description:
    "Equipos seleccionados, revisados y listos para vos. Consultá por WhatsApp.",
  openGraph: {
    title: "iPhones usados — Electronic Point",
    description:
      "Equipos seleccionados, revisados y listos para vos. Consultá por WhatsApp.",
    type: "website",
  },
};

export default async function UsadosPage() {
  const [products, models] = await Promise.all([
    getPublishedIphones(),
    getPublishedModelNames(),
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <CatalogHeader />

      <section className="relative overflow-hidden border-b border-card-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_color-mix(in_srgb,var(--accent)_18%,transparent),_transparent_55%)]"
        />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16 sm:px-6 sm:py-24 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted">
              Electronic Point
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              iPhones usados
            </h1>
            <p className="text-base text-muted sm:text-lg">
              Equipos seleccionados, revisados y listos para vos.
            </p>
            <a
              href="#equipos"
              className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-contrast transition-colors hover:bg-accent-hover"
            >
              Ver equipos disponibles
            </a>
          </div>
          <div className="grid max-w-md grid-cols-2 gap-3 lg:w-[420px]">
            <div className="aspect-[3/4] rounded-3xl bg-gradient-to-br from-zinc-700/40 to-zinc-900/60 ring-1 ring-white/10" />
            <div className="mt-8 aspect-[3/4] rounded-3xl bg-gradient-to-br from-accent/25 to-zinc-800/50 ring-1 ring-accent/20" />
          </div>
        </div>
      </section>

      <section id="equipos" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Equipos disponibles
          </h2>
          <p className="mt-1 text-sm text-muted">
            {products.length} equipo{products.length === 1 ? "" : "s"} publicado
            {products.length === 1 ? "" : "s"}
          </p>
        </div>
        <CatalogGrid products={products} models={models} />
      </section>

      <CatalogFooter />
    </div>
  );
}
