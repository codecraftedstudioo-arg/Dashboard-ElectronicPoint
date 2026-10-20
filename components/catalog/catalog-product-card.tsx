"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCatalogSite } from "@/components/catalog/catalog-site-context";
import { DualPrice } from "@/components/currency/currency-toggle";
import { Badge, cn } from "@/components/ui";
import {
  CONDITION_COLORS,
  PHYSICAL_CONDITION_LABELS,
} from "@/lib/constants";
import { sortProductImages } from "@/lib/images";
import { ReservedOverlay } from "@/components/products/reserved-overlay";
import { deviceColorBadgeStyle } from "@/lib/device-color";
import { buildProductSlug } from "@/lib/product-slug";
import type { PublicCatalogProduct } from "@/lib/public-catalog";

const SLIDE_MS = 2530;

export function CatalogProductCard({
  product,
  className,
}: {
  product: PublicCatalogProduct;
  className?: string;
}) {
  const images = useMemo(
    () => sortProductImages(product.images),
    [product.images],
  );
  const { productPath } = useCatalogSite();
  const href = productPath(buildProductSlug(product));
  const rootRef = useRef<HTMLAnchorElement>(null);
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const phase = useMemo(() => {
    let offset = 0;
    for (let i = 0; i < product.id.length; i++) {
      offset = (offset + product.id.charCodeAt(i) * (i + 1)) % 2200;
    }
    return offset;
  }, [product.id]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || images.length < 2) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [images.length]);

  useEffect(() => {
    if (images.length < 2 || paused || !visible) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer = 0;
    const tick = () => {
      if (!document.hidden) {
        setIndex((current) => (current + 1) % images.length);
      }
      timer = window.setTimeout(tick, SLIDE_MS);
    };
    timer = window.setTimeout(tick, SLIDE_MS + phase);
    return () => window.clearTimeout(timer);
  }, [images.length, paused, phase, visible]);

  const previous =
    images.length > 1 ? (index - 1 + images.length) % images.length : 0;
  const upcoming = images.length > 1 ? (index + 1) % images.length : 0;
  const slots =
    images.length < 2 ? [0] : [...new Set([previous, index, upcoming])];
  const activeReady = Boolean(images[index] && loaded[images[index].id]);
  const reserved = product.isReserved;
  const colorStyle = deviceColorBadgeStyle(product.color);

  return (
    <Link
      ref={rootRef}
      href={href}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={cn(
        "group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/35 bg-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_18px_40px_rgba(0,0,0,0.18)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/20 light:border-white/80 light:bg-white/25 light:shadow-[inset_0_1px_0_rgba(255,255,255,1),0_16px_40px_rgba(0,123,255,0.12)] light:hover:bg-white/35",
        className,
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-input">
        {images.length ? (
          <>
            {!activeReady ? (
              <div className="absolute inset-0 animate-pulse bg-hover" />
            ) : null}
            {slots.map((slot) => {
              const image = images[slot];
              const active = slot === index;
              const ready = Boolean(loaded[image.id]);
              return (
                <Image
                  key={image.id}
                  src={image.url}
                  alt={active ? product.name : ""}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 25vw"
                  className={cn(
                    "object-cover transition-opacity duration-700",
                    active
                      ? ready
                        ? reserved
                          ? "z-10 opacity-50"
                          : "z-10 opacity-100"
                        : "z-10 opacity-0"
                      : slot === previous && !activeReady
                        ? reserved
                          ? "z-0 opacity-50"
                          : "z-0 opacity-100"
                        : "z-0 opacity-0",
                  )}
                  onLoad={() =>
                    setLoaded((current) =>
                      current[image.id]
                        ? current
                        : { ...current, [image.id]: true },
                    )
                  }
                />
              );
            })}
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            Sin imagen
          </div>
        )}
        <ReservedOverlay active={reserved} className="z-20" />
        {product.isOpportunity ? (
          <span className="absolute top-3 left-0 z-30 rounded-r-full bg-amber-500 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white shadow-md">
            Oportunidad
          </span>
        ) : null}
        <div className="absolute bottom-3 left-3 z-30 max-w-[calc(100%-1.5rem)] rounded-2xl border border-white/80 bg-white/30 px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-2xl">
          <DualPrice
            amount={product.salePrice}
            className="text-sm"
            arsClassName="text-[0.72em]"
          />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 px-4 py-3">
        <h3 className="break-words text-lg font-semibold tracking-tight text-foreground">
          {product.name}
        </h3>
        <div className="flex min-w-0 flex-wrap gap-1.5">
          <Badge className="border-emerald-500/30 bg-emerald-500/15 text-emerald-500">
            {product.storage}
          </Badge>
          <Badge
            className={
              colorStyle
                ? "border-transparent"
                : "border-card-border text-muted"
            }
            style={colorStyle}
          >
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
        <span className="mt-auto inline-flex w-fit self-center items-center justify-center rounded-full border border-white/70 bg-white/25 px-3 py-1.5 text-sm font-semibold text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-2xl transition-colors group-hover:bg-white/45 light:border-white/90 light:bg-white/40 light:group-hover:bg-white/65">
          Ver equipo →
        </span>
      </div>
    </Link>
  );
}
