"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/components/ui";

export type GalleryImage = {
  id: string;
  url: string;
  isPrimary?: boolean;
};

type ProductGalleryProps = {
  images: GalleryImage[];
  productName: string;
};

const SWIPE_THRESHOLD = 50;

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const total = images.length;
  const current = images[index];
  const canPrev = index > 0;
  const canNext = index < total - 1;

  const goTo = useCallback(
    (next: number) => {
      if (total === 0) return;
      setIndex(Math.max(0, Math.min(next, total - 1)));
    },
    [total],
  );

  const prev = useCallback(() => goTo(index - 1), [goTo, index]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  useEffect(() => {
    const scroller = thumbsRef.current;
    const thumb = thumbRefs.current[index];
    if (!scroller || !thumb) return;
    const left =
      thumb.offsetLeft - (scroller.clientWidth - thumb.offsetWidth) / 2;
    scroller.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [index]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (lightboxOpen && e.key === "Escape") {
        e.preventDefault();
        closeLightbox();
        return;
      }
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [prev, next, lightboxOpen, closeLightbox]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [lightboxOpen]);

  if (!total || !current) {
    return (
      <div className="flex aspect-square w-full max-w-full items-center justify-center rounded-2xl bg-input text-muted sm:aspect-[4/3]">
        Sin imagen
      </div>
    );
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) >= SWIPE_THRESHOLD) {
      if (diff < 0 && canNext) next();
      if (diff > 0 && canPrev) prev();
    }
    touchStartX.current = null;
  }

  return (
    <div className="w-full min-w-0 max-w-full space-y-3">
      <div className="relative w-full min-w-0 max-w-full">
        <div
          role="button"
          tabIndex={0}
          aria-label="Ampliar imagen"
          className="relative aspect-square w-full max-w-full cursor-zoom-in overflow-hidden rounded-2xl bg-input sm:aspect-[4/3]"
          onClick={() => setLightboxOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setLightboxOpen(true);
            }
          }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {!loaded[current.id] ? (
            <div className="absolute inset-0 animate-pulse bg-hover" />
          ) : null}
          <Image
            key={current.id}
            src={current.url}
            alt={`${productName} — foto ${index + 1}`}
            fill
            priority={index === 0}
            sizes="(max-width: 768px) 100vw, 640px"
            className={cn(
              "object-contain p-2 transition-opacity duration-200 sm:p-4",
              loaded[current.id] ? "opacity-100" : "opacity-0",
            )}
            onLoad={() =>
              setLoaded((prev) => ({ ...prev, [current.id]: true }))
            }
          />

          {total > 1 ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                disabled={!canPrev}
                aria-label="Foto anterior"
                className={cn(
                  "absolute left-1.5 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-card-border bg-background/90 text-foreground shadow-sm backdrop-blur transition-colors touch-manipulation sm:left-2 sm:h-11 sm:w-11",
                  "hover:bg-hover disabled:pointer-events-none disabled:opacity-30",
                )}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                disabled={!canNext}
                aria-label="Foto siguiente"
                className={cn(
                  "absolute right-1.5 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-card-border bg-background/90 text-foreground shadow-sm backdrop-blur transition-colors touch-manipulation sm:right-2 sm:h-11 sm:w-11",
                  "hover:bg-hover disabled:pointer-events-none disabled:opacity-30",
                )}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          ) : null}

          {total > 1 ? (
            <div className="pointer-events-none absolute right-2 top-2 max-w-[calc(100%-1rem)] truncate rounded-full bg-background/85 px-2.5 py-1 text-xs font-medium tabular-nums text-foreground backdrop-blur sm:right-3 sm:top-3">
              {index + 1} / {total}
            </div>
          ) : null}
        </div>
      </div>

      {total > 1 ? (
        <div
          ref={thumbsRef}
          className="catalog-thumb-scroll flex w-full min-w-0 max-w-full gap-2 overflow-x-auto overscroll-x-contain touch-pan-x"
        >
          {images.map((img, i) => (
            <button
              key={img.id}
              ref={(el) => {
                thumbRefs.current[i] = el;
              }}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              className={cn(
                "relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition-colors touch-manipulation sm:h-16 sm:w-16",
                i === index
                  ? "border-accent ring-2 ring-accent/30"
                  : "border-card-border opacity-70 hover:opacity-100",
              )}
            >
              <Image
                src={img.url}
                alt=""
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}

      {lightboxOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${productName} — foto ampliada`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 sm:p-4"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Cerrar"
            className="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 sm:right-4 sm:top-4 sm:h-11 sm:w-11"
          >
            <X className="h-5 w-5" />
          </button>

          {total > 1 ? (
            <div className="absolute left-1/2 top-[max(0.75rem,env(safe-area-inset-top))] z-10 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium tabular-nums text-white backdrop-blur sm:top-4">
              {index + 1} / {total}
            </div>
          ) : null}

          {total > 1 ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                disabled={!canPrev}
                aria-label="Foto anterior"
                className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition-colors touch-manipulation hover:bg-white/20 disabled:pointer-events-none disabled:opacity-30 sm:left-6 sm:h-12 sm:w-12"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                disabled={!canNext}
                aria-label="Foto siguiente"
                className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition-colors touch-manipulation hover:bg-white/20 disabled:pointer-events-none disabled:opacity-30 sm:right-6 sm:h-12 sm:w-12"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          ) : null}

          <div
            className="relative h-full max-h-[85vh] w-full min-w-0 max-w-5xl"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <Image
              key={`lightbox-${current.id}`}
              src={current.url}
              alt={`${productName} — foto ${index + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
