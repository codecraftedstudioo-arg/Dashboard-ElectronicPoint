"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCatalogSite } from "@/components/catalog/catalog-site-context";

const SLIDE_COUNT = 2;
const ROTATE_MS = 7000;

export function CatalogHero({ availableLabel }: { availableLabel: string }) {
  const { quotePath } = useCatalogSite();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches || paused) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % SLIDE_COUNT);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <section
      className="relative border-b border-card-border"
      aria-roledescription="carrusel"
      aria-label="Destacados"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="grid w-full min-w-0">
        <div
          className={index === 0 ? "col-start-1 row-start-1" : "invisible col-start-1 row-start-1"}
          aria-hidden={index !== 0}
          inert={index !== 0}
        >
          <CurrentHero availableLabel={availableLabel} />
        </div>
        <div
          className={index === 1 ? "col-start-1 row-start-1" : "invisible col-start-1 row-start-1"}
          aria-hidden={index !== 1}
          inert={index !== 1}
        >
          <PlanCanjeSlide href={quotePath()} />
        </div>
      </div>

      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {["Usados premium", "Plan Canje"].map((label, slide) => {
          const selected = index === slide;
          return (
            <button
              key={label}
              type="button"
              aria-label={label}
              aria-current={selected ? "true" : undefined}
              onClick={() => setIndex(slide)}
              className={
                selected
                  ? "h-2 w-6 rounded-full bg-accent"
                  : "h-2 w-2 rounded-full bg-foreground/35"
              }
            />
          );
        })}
      </div>
    </section>
  );
}

function CurrentHero({ availableLabel }: { availableLabel: string }) {
  return (
    <div className="relative h-full overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_color-mix(in_srgb,var(--accent)_18%,transparent),_transparent_55%)]"
      />
      <div className="relative mx-auto grid w-full min-w-0 max-w-6xl grid-cols-1 gap-8 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,36rem)_420px] lg:items-end lg:justify-between lg:gap-x-8">
        <div className="flex max-w-xl flex-col items-start text-left">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Usados premium
          </h1>
          <div className="mt-2 space-y-1">
            <p className="text-base text-muted sm:text-lg">
              Equipos seleccionados, revisados y listos para vos.
            </p>
            <p className="text-base text-muted sm:text-lg">
              Garantía de 90 días.
            </p>
          </div>
          <a
            href="#equipos"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-contrast transition-colors hover:bg-accent-hover"
          >
            Ver equipos disponibles
          </a>
          <p className="mt-4 flex min-w-0 items-center gap-2 text-base text-muted sm:text-lg">
            <span
              aria-hidden
              className="h-2 w-2 shrink-0 rounded-full bg-[#34c759]"
            />
            <span className="min-w-0 leading-snug">{availableLabel}</span>
          </p>
        </div>
        <div
          aria-hidden
          className="grid w-full min-w-0 max-w-md grid-cols-2 gap-3 lg:w-[420px]"
        >
          <div className="relative aspect-[3/4] overflow-hidden rounded-3xl bg-input ring-1 ring-card-border">
            <Image
              src="/catalog/hero-iphone-pro.jpg"
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 45vw, 210px"
              className="object-cover"
            />
          </div>
          <div className="relative mt-8 aspect-[3/4] overflow-hidden rounded-3xl bg-input ring-1 ring-card-border">
            <Image
              src="/catalog/hero-iphone.jpg"
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 45vw, 210px"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanCanjeSlide({ href }: { href: string }) {
  return (
    <div className="flex h-full w-full items-center bg-[#eef5fb]">
      <div className="relative w-full">
        <Image
          src="/catalog/hero-plan-canje-portrait.jpg"
          alt="Plan Canje. Entregá tu iPhone y llevate el próximo."
          width={1728}
          height={3072}
          sizes="100vw"
          className="h-auto w-full md:hidden"
        />
        <Image
          src="/catalog/hero-plan-canje-desktop.jpg"
          alt="Plan Canje. Entregá tu iPhone y llevate el próximo."
          width={1024}
          height={409}
          sizes="100vw"
          className="hidden h-auto w-full md:block"
        />
        <Link
          href={href}
          className="absolute left-[8%] top-[37%] inline-flex items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-contrast transition-colors hover:bg-accent-hover md:left-[5%] md:top-[64%] md:px-5 md:py-2.5 md:text-sm md:leading-normal"
        >
          Plan Canje
        </Link>
      </div>
    </div>
  );
}
