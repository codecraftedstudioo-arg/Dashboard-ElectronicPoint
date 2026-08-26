"use client";

import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { Button } from "@/components/ui";

export function ShareProductLink({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;

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
    <Button
      type="button"
      variant="secondary"
      className="w-full min-h-11 max-w-full"
      onClick={handleShare}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          Link copiado
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4 sm:hidden" />
          <Link2 className="hidden h-4 w-4 sm:block" />
          Compartir equipo
        </>
      )}
    </Button>
  );
}
