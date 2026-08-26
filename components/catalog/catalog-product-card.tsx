"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Badge, cn } from "@/components/ui";
import {
  CONDITION_COLORS,
  PHYSICAL_CONDITION_LABELS,
} from "@/lib/constants";
import { primaryImageUrl } from "@/lib/images";
import { buildProductSlug } from "@/lib/product-slug";
import type { PublicCatalogProduct } from "@/lib/public-catalog";

export function CatalogProductCard({ product }: { product: PublicCatalogProduct }) {
  const img = primaryImageUrl(product.images);
  const href = `/usados/${buildProductSlug(product)}`;
  const [loaded, setLoaded] = useState(false);

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-card-border bg-card shadow-[var(--shadow)] transition-all duration-300 hover:-translate-y-1 hover:border-accent/35 hover:shadow-[0_16px_40px_rgba(15,23,42,0.12)]"
    >
      <div className="relative aspect-[4/5] bg-input">
        {img ? (
          <>
            {!loaded ? (
              <div className="absolute inset-0 animate-pulse bg-hover" />
            ) : null}
            <Image
              src={img}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={cn(
                "object-cover transition-all duration-500 group-hover:scale-[1.02]",
                loaded ? "scale-100 opacity-100 blur-0" : "scale-105 opacity-0 blur-sm",
              )}
              onLoad={() => setLoaded(true)}
            />
          </>
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
        <div className="flex flex-wrap gap-1.5">
          <Badge className="border-emerald-500/30 bg-emerald-500/15 text-emerald-500">
            {product.storage}
          </Badge>
          <Badge className="border-card-border text-muted">
            {product.color}
          </Badge>
          {product.batteryCondition != null ? (
            <Badge className="border-emerald-500/30 bg-emerald-500/15 text-emerald-500">
              🔋 {product.batteryCondition}%
            </Badge>
          ) : null}
          {product.chip ? (
            <Badge className="border-card-border text-muted">
              {product.chip === "ESIM" ? "eSIM" : "SIM"}
            </Badge>
          ) : null}
          <Badge className={CONDITION_COLORS[product.physicalCondition]}>
            {PHYSICAL_CONDITION_LABELS[product.physicalCondition]}
          </Badge>
          <Badge className="border-emerald-500/30 bg-emerald-500/15 text-emerald-500">
            Garantía 90 días
          </Badge>
        </div>
        <div className="mt-auto flex items-baseline gap-1.5 pt-3">
          <span className="text-xl font-semibold tracking-tight text-foreground">
            {Math.round(product.salePrice)
              .toString()
              .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
          </span>
          <span className="text-sm font-medium text-muted">USD</span>
        </div>
        <span className="mt-1 inline-flex w-full items-center justify-center text-sm font-medium text-muted transition-colors group-hover:text-accent">
          Ver equipo →
        </span>
      </div>
    </Link>
  );
}
