"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useCatalogSite } from "@/components/catalog/catalog-site-context";
import { ShareCatalogButton } from "@/components/catalog/share-catalog-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";

function AppleLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

export function CatalogHeader() {
  const pathname = usePathname();
  const { isCatalogSite, homePath } = useCatalogSite();
  const isCatalogHome =
    pathname === "/usados" || (isCatalogSite && pathname === "/");
  const isProductPage =
    pathname.startsWith("/usados/") ||
    (isCatalogSite && pathname !== "/" && !pathname.startsWith("/usados"));

  return (
    <header className="sticky top-0 z-40 border-b border-card-border/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-[4.5rem] sm:px-6 lg:h-20 lg:px-8">
        <Link
          href={homePath}
          aria-current={isCatalogHome ? "page" : undefined}
          aria-label={isProductPage ? "Volver al catálogo" : undefined}
          title={isProductPage ? "Volver al catálogo" : undefined}
          className="inline-flex items-center gap-1.5 text-lg font-semibold tracking-tight text-foreground transition-colors hover:text-accent sm:gap-2 sm:text-xl lg:text-[1.35rem]"
        >
          {isProductPage ? (
            <ChevronLeft
              className="h-5 w-5 shrink-0 sm:h-6 sm:w-6"
              aria-hidden
            />
          ) : null}
          <AppleLogo className="h-5 w-5 shrink-0 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
          Usados premium
        </Link>
        <div className="flex items-center">
          <ShareCatalogButton />
          <div className="ml-3 flex items-center border-l border-card-border pl-3 sm:ml-4 sm:pl-4 lg:ml-6 lg:pl-6">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

export function CatalogFooter() {
  return (
    <footer id="contacto" className="border-t border-card-border bg-card/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm text-muted">
          iPhones usados seleccionados y revisados.
        </p>
        <p
          className="text-xs font-medium tracking-wide text-muted/50 sm:text-sm"
          aria-label="Desarrollado por CodeCraftedStudio"
        >
          CodeCraftedStudio
        </p>
      </div>
    </footer>
  );
}
