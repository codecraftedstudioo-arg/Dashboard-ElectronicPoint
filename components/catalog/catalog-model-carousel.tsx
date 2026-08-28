"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CatalogProductCard } from "@/components/catalog/catalog-product-card";
import { cn } from "@/components/ui";
import type { PublicCatalogProduct } from "@/lib/public-catalog";

export function CatalogModelCarousel({
  model,
  products,
}: {
  model: string;
  products: PublicCatalogProduct[];
}) {
  const headingId = useId();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const hasOverflow = max > 4;
    setOverflows(hasOverflow);
    setCanPrev(hasOverflow && el.scrollLeft > 4);
    setCanNext(hasOverflow && el.scrollLeft < max - 4);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateScrollState();
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState, products.length]);

  const scrollByCard = useCallback((direction: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const item = el.querySelector<HTMLElement>("[data-carousel-item]");
    const gap = parseFloat(getComputedStyle(el).columnGap || getComputedStyle(el).gap) || 12;
    const amount = (item?.offsetWidth ?? el.clientWidth * 0.8) + gap;
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  }, []);

  const countLabel =
    products.length === 1
      ? "1 equipo disponible"
      : `${products.length} equipos disponibles`;

  const showControls = products.length > 1 && overflows;
  const single = products.length === 1;

  return (
    <section
      aria-labelledby={headingId}
      className="w-full min-w-0 max-w-full"
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          scrollByCard(-1);
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          scrollByCard(1);
        }
      }}
    >
      <div className="mb-3 flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <h2
            id={headingId}
            className="truncate text-lg font-semibold tracking-tight text-foreground sm:text-xl"
          >
            {model}
          </h2>
          <p className="mt-0.5 text-xs text-muted sm:text-sm">{countLabel}</p>
        </div>
        {showControls ? (
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              aria-label="Anterior"
              disabled={!canPrev}
              onClick={() => scrollByCard(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-card-border bg-card text-foreground shadow-sm transition-colors hover:border-accent/40 hover:text-accent disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Siguiente"
              disabled={!canNext}
              onClick={() => scrollByCard(1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-card-border bg-card text-foreground shadow-sm transition-colors hover:border-accent/40 hover:text-accent disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>

      <div
        ref={scrollerRef}
        tabIndex={showControls ? 0 : undefined}
        aria-label={showControls ? `Carrusel de ${model}` : undefined}
        className={cn(
          "catalog-h-scroll flex w-full min-w-0 max-w-full gap-3 py-1",
          single
            ? "overflow-hidden"
            : "snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain",
        )}
      >
        {products.map((product) => (
          <div
            key={product.id}
            data-carousel-item
            className={cn(
              "flex min-w-0 shrink-0",
              single
                ? "w-full max-w-[19.5rem] sm:max-w-[20.5rem]"
                : "w-[calc(100%-2.75rem)] snap-start sm:w-[calc((100%-0.75rem)/2)] lg:w-[calc((100%-1.5rem)/3)] xl:w-[calc((100%-2.25rem)/4)]",
            )}
          >
            <CatalogProductCard product={product} className="h-full" />
          </div>
        ))}
      </div>
    </section>
  );
}
