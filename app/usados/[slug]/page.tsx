import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  CatalogFooter,
  CatalogHeader,
} from "@/components/catalog/catalog-chrome";
import { ProductGallery } from "@/components/products/product-gallery";
import { Badge } from "@/components/ui";
import {
  CONDITION_COLORS,
  PHYSICAL_CONDITION_LABELS,
} from "@/lib/constants";
import {
  buildWhatsAppUrl,
  catalogInquiryMessage,
} from "@/lib/contact";
import { formatUSD } from "@/lib/currency";
import { primaryImageUrl } from "@/lib/images";
import { parseProductIdFromSlug } from "@/lib/product-slug";
import { getPublishedIphoneById } from "@/lib/public-catalog";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const id = parseProductIdFromSlug(slug);
  if (!id) return { title: "Equipo no encontrado — Electronic Point" };

  const product = await getPublishedIphoneById(id);
  if (!product) return { title: "Equipo no encontrado — Electronic Point" };

  const title = `${product.name} ${product.storage} usado — Electronic Point`;
  const description =
    product.description ||
    `${product.name} ${product.storage} en estado ${PHYSICAL_CONDITION_LABELS[product.physicalCondition]}. Precio ${formatUSD(product.salePrice)}.`;
  const image = primaryImageUrl(product.images);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}

export default async function UsadosProductPage({ params }: PageProps) {
  const { slug } = await params;
  const id = parseProductIdFromSlug(slug);
  if (!id) notFound();

  const product = await getPublishedIphoneById(id);
  if (!product) notFound();

  const wa = buildWhatsAppUrl(catalogInquiryMessage(product));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <CatalogHeader />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <Link
          href="/usados"
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          ← Volver al catálogo
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <div className="rounded-2xl border border-card-border bg-card p-3 sm:p-4">
            <ProductGallery
              images={product.images.map((img) => ({
                id: img.id,
                url: img.url,
                isPrimary: img.isPrimary,
              }))}
              productName={product.name}
            />
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {product.name}
              </h1>
              <p className="mt-2 text-lg text-muted">{product.storage}</p>
              <p className="mt-1 text-sm text-muted">{product.color}</p>
            </div>

            <div className="text-3xl font-semibold text-foreground">
              {formatUSD(product.salePrice)}
            </div>

            <div className="grid gap-3 rounded-2xl border border-card-border bg-card p-4">
              <InfoRow
                label="Batería"
                value={
                  product.batteryCondition != null
                    ? `${product.batteryCondition}%`
                    : "—"
                }
              />
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-muted">Estado</span>
                <Badge className={CONDITION_COLORS[product.physicalCondition]}>
                  {PHYSICAL_CONDITION_LABELS[product.physicalCondition]}
                </Badge>
              </div>
            </div>

            {product.description ? (
              <div>
                <h2 className="text-sm font-medium text-muted">Descripción</h2>
                <p className="mt-2 text-sm leading-relaxed text-foreground">
                  {product.description}
                </p>
              </div>
            ) : null}

            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center rounded-full bg-[#25D366] px-5 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto"
            >
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      </div>

      <CatalogFooter />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
