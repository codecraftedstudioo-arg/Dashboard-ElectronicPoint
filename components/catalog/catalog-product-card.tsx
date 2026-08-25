import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui";
import {
  CONDITION_COLORS,
  PHYSICAL_CONDITION_LABELS,
} from "@/lib/constants";
import { formatUSD } from "@/lib/currency";
import { primaryImageUrl } from "@/lib/images";
import { buildProductSlug } from "@/lib/product-slug";
import type { PublicCatalogProduct } from "@/lib/public-catalog";

export function CatalogProductCard({ product }: { product: PublicCatalogProduct }) {
  const img = primaryImageUrl(product.images);
  const href = `/usados/${buildProductSlug(product)}`;

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-card-border bg-card shadow-[var(--shadow)] transition-colors hover:border-accent/35"
    >
      <div className="relative aspect-[4/5] bg-input">
        {img ? (
          <Image
            src={img}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            Sin imagen
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          {product.name}
        </h3>
        <p className="text-sm text-muted">{product.storage}</p>
        <div className="flex flex-wrap gap-1.5">
          {product.batteryCondition != null ? (
            <Badge className="border-card-border text-muted">
              🔋 {product.batteryCondition}% batería
            </Badge>
          ) : null}
          <Badge className={CONDITION_COLORS[product.physicalCondition]}>
            {PHYSICAL_CONDITION_LABELS[product.physicalCondition]}
          </Badge>
        </div>
        <div className="mt-auto pt-3 text-xl font-semibold text-foreground">
          {formatUSD(product.salePrice)}
        </div>
        <span className="inline-flex w-full items-center justify-center rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-contrast transition-colors group-hover:bg-accent-hover">
          Ver equipo
        </span>
      </div>
    </Link>
  );
}
