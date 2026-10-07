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
import { buildProductSlug } from "@/lib/product-slug";
import type { PublicCatalogProduct } from "@/lib/public-catalog";

const SLIDE_MS = 3800;

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

  return (
    <Link
      ref={rootRef}
      href={href}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={cn(
        "group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-card-border bg-card shadow-[var(--shadow)] transition-all duration-300 hover:-translate-y-1 hover:border-accent/35 hover:shadow-[0_16px_40px_rgba(15,23,42,0.12)]",
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
                        ? "z-10 opacity-100"
                        : "z-10 opacity-0"
                      : slot === previous && !activeReady
                        ? "z-0 opacity-100"
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
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="break-words text-lg font-semibold tracking-tight text-foreground">
          {product.name}
        </h3>
        <div className="flex min-w-0 flex-wrap gap-1.5">
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
            Garantía 30 días
          </Badge>
        </div>
        <DualPrice
          amount={product.salePrice}
          className="mt-auto pt-3 text-xl"
          arsClassName="text-[0.55em]"
        />
        <span className="mt-1 inline-flex w-full items-center justify-center text-sm font-medium text-muted transition-colors group-hover:text-accent">
          Ver equipo →
        </span>
      </div>
    </Link>
  );
}
