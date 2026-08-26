"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { useCatalogSite } from "@/components/catalog/catalog-site-context";
import { cn } from "@/components/ui";

export function ShareCatalogButton({
  className,
}: {
  className?: string;
}) {
  const { homePath } = useCatalogSite();
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}${homePath === "/" ? "" : homePath}`;
    const title = "Usados premium";
    const text = "Catálogo de iPhones usados — Usados premium";

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={copied ? "Link del catálogo copiado" : "Compartir catálogo"}
      title={copied ? "Link copiado" : "Compartir catálogo"}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-card-border bg-card px-2.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-accent/40 hover:text-accent sm:px-3.5",
        className,
      )}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Copiado</span>
        </>
      ) : (
        <>
          <Share2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Compartir</span>
        </>
      )}
    </button>
  );
}
