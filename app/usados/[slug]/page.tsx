import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  CatalogFooter,
  CatalogHeader,
} from "@/components/catalog/catalog-chrome";
import { ProductGallery } from "@/components/products/product-gallery";
import { ShareProductLink } from "@/components/catalog/share-product-link";
import { Badge } from "@/components/ui";
import {
  CONDITION_COLORS,
  PHYSICAL_CONDITION_LABELS,
  CHIP_TYPE_LABELS,
} from "@/lib/constants";
import { formatUSD } from "@/lib/currency";
import {
  catalogEquiposPath,
  catalogProductPath,
  hostFromHeaders,
  isCatalogHost,
  PUBLIC_CATALOG_ORIGIN,
} from "@/lib/domains";
import { primaryImageUrl } from "@/lib/images";
import { buildProductSlug, parseProductIdFromSlug } from "@/lib/product-slug";
import {
  getPublishedIphoneById,
  getPublishedIphoneNeighbors,
} from "@/lib/public-catalog";
import {
  CATALOG_DESCRIPTION,
  CATALOG_TITLE,
  catalogProductMetadata,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const id = parseProductIdFromSlug(slug);
  if (!id) {
    return catalogProductMetadata({
      title: `Equipo no encontrado — ${CATALOG_TITLE}`,
      description: CATALOG_DESCRIPTION,
    });
  }

  const product = await getPublishedIphoneById(id);
  if (!product) {
    return catalogProductMetadata({
      title: `Equipo no encontrado — ${CATALOG_TITLE}`,
      description: CATALOG_DESCRIPTION,
    });
  }

  const title = `${product.name} ${product.storage} usado — ${CATALOG_TITLE}`;
  const description =
    product.description ||
    `${product.name} ${product.storage} en estado ${PHYSICAL_CONDITION_LABELS[product.physicalCondition]}. Precio ${formatUSD(product.salePrice)}.`;
  const image = primaryImageUrl(product.images);

  return catalogProductMetadata({
    title,
    description,
    image,
    url: `${PUBLIC_CATALOG_ORIGIN}/${buildProductSlug(product)}`,
  });
}

export default async function UsadosProductPage({ params }: PageProps) {
  const { slug } = await params;
  const id = parseProductIdFromSlug(slug);
  if (!id) notFound();

  const product = await getPublishedIphoneById(id);
  if (!product) notFound();

  const { prev, next } = await getPublishedIphoneNeighbors(product.id);
  const headerStore = await headers();
  const isCatalogSite =
    headerStore.get("x-catalog-site") === "1" ||
    isCatalogHost(hostFromHeaders(headerStore));
  const equiposHref = catalogEquiposPath(isCatalogSite);
  const prevHref = prev
    ? catalogProductPath(buildProductSlug(prev), isCatalogSite)
    : null;
  const nextHref = next
    ? catalogProductPath(buildProductSlug(next), isCatalogSite)
    : null;

  return (
    <div className="min-h-screen w-full min-w-0 bg-background text-foreground">
      <CatalogHeader />

      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <Link
          href={equiposHref}
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          ← Volver al catálogo
        </Link>

        <div className="mt-6 grid min-w-0 gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <div className="w-full min-w-0 max-w-full rounded-2xl border border-card-border bg-card p-2 sm:p-4">
            <ProductGallery
              images={product.images.map((img) => ({
                id: img.id,
                url: img.url,
                isPrimary: img.isPrimary,
              }))}
              productName={product.name}
            />
          </div>

          <div className="min-w-0 max-w-full space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="space-y-4">
              <div className="min-w-0">
                <h1 className="break-words text-2xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {product.name}
                </h1>
                <div className="mt-3">
                  <Badge className="max-w-full border-card-border text-muted">
                    {product.color}
                  </Badge>
                </div>
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  Precio
                </p>
                <p className="mt-1 flex min-w-0 flex-wrap items-baseline gap-1.5">
                  <span className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                    {Math.round(product.salePrice)
                      .toString()
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                  </span>
                  <span className="text-base font-medium text-muted sm:text-lg">
                    USD
                  </span>
                </p>
              </div>
            </div>

            <div className="w-full min-w-0 max-w-full rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
              <p className="text-sm font-semibold text-emerald-500">
                Garantía de 90 días
              </p>
              <p className="mt-0.5 text-xs text-muted">
                Equipo revisado y respaldado.
              </p>
            </div>

            <div className="grid w-full min-w-0 max-w-full gap-3 rounded-2xl border border-card-border bg-card p-4">
              <div className="flex min-w-0 items-center justify-between gap-3 text-sm">
                <span className="shrink-0 text-muted">Capacidad</span>
                <Badge className="min-w-0 max-w-[70%] truncate border-emerald-500/30 bg-emerald-500/15 text-emerald-500">
                  {product.storage}
                </Badge>
              </div>
              <div className="flex min-w-0 items-center justify-between gap-3 text-sm">
                <span className="shrink-0 text-muted">Batería</span>
                <Badge className="min-w-0 max-w-[70%] truncate border-emerald-500/30 bg-emerald-500/15 text-emerald-500">
                  {product.batteryCondition != null
                    ? `${product.batteryCondition}%`
                    : "—"}
                </Badge>
              </div>
              <div className="flex min-w-0 items-center justify-between gap-3 text-sm">
                <span className="shrink-0 text-muted">Chip</span>
                <Badge className="min-w-0 max-w-[70%] truncate border-card-border text-muted">
                  {product.chip ? CHIP_TYPE_LABELS[product.chip] : "—"}
                </Badge>
              </div>
              <div className="flex min-w-0 items-center justify-between gap-3 text-sm">
                <span className="shrink-0 text-muted">Estado</span>
                <Badge
                  className={`min-w-0 max-w-[70%] truncate ${CONDITION_COLORS[product.physicalCondition]}`}
                >
                  {PHYSICAL_CONDITION_LABELS[product.physicalCondition]}
                </Badge>
              </div>
            </div>

            {product.description ? (
              <div className="min-w-0 max-w-full">
                <h2 className="text-sm font-medium text-muted">Descripción</h2>
                <p className="mt-2 break-words text-sm leading-relaxed text-foreground">
                  {product.description}
                </p>
              </div>
            ) : null}

            <ShareProductLink
              title={`${product.name} ${product.storage}`}
              text={`${product.name} ${product.storage} — ${formatUSD(product.salePrice)}`}
            />
          </div>
        </div>

        {prev || next ? (
          <nav
            aria-label="Otros equipos"
            className="mt-12 flex min-w-0 items-stretch gap-3 border-t border-card-border pt-8"
          >
            {prev && prevHref ? (
              <Link
                href={prevHref}
                className="group flex min-w-0 flex-1 flex-col gap-1 rounded-2xl border border-card-border bg-card px-3 py-3 transition-colors hover:border-accent/35 sm:px-4"
              >
                <span className="inline-flex items-center gap-1 text-xs text-muted">
                  <ChevronLeft className="h-3.5 w-3.5 shrink-0" />
                  Anterior
                </span>
                <span className="truncate text-sm font-medium text-foreground group-hover:text-accent">
                  {prev.name} {prev.storage}
                </span>
              </Link>
            ) : (
              <div className="hidden flex-1 sm:block" />
            )}
            {next && nextHref ? (
              <Link
                href={nextHref}
                className="group flex min-w-0 flex-1 flex-col items-end gap-1 rounded-2xl border border-card-border bg-card px-3 py-3 text-right transition-colors hover:border-accent/35 sm:px-4"
              >
                <span className="inline-flex items-center gap-1 text-xs text-muted">
                  Siguiente
                  <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                </span>
                <span className="truncate text-sm font-medium text-foreground group-hover:text-accent">
                  {next.name} {next.storage}
                </span>
              </Link>
            ) : (
              <div className="hidden flex-1 sm:block" />
            )}
          </nav>
        ) : null}
      </div>

      <CatalogFooter />
    </div>
  );
}
