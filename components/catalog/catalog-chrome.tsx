import Link from "next/link";
import {
  buildWhatsAppUrl,
  generalInquiryMessage,
  PUBLIC_CONTACT,
} from "@/lib/contact";

export function CatalogHeader() {
  const wa = buildWhatsAppUrl(generalInquiryMessage());

  return (
    <header className="sticky top-0 z-40 border-b border-card-border/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/usados" className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
          {PUBLIC_CONTACT.brandName}
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted sm:flex">
          <a href="/usados#equipos" className="transition-colors hover:text-foreground">
            iPhones usados
          </a>
          <a href="/usados#contacto" className="transition-colors hover:text-foreground">
            Contacto
          </a>
        </nav>
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-full bg-[#25D366] px-3.5 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 sm:px-4 sm:text-sm"
        >
          Consultar por WhatsApp
        </a>
      </div>
    </header>
  );
}

export function CatalogFooter() {
  const wa = buildWhatsAppUrl(generalInquiryMessage());

  return (
    <footer id="contacto" className="border-t border-card-border bg-card/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <div className="font-semibold text-foreground">{PUBLIC_CONTACT.brandName}</div>
          <p className="mt-1 text-sm text-muted">
            iPhones usados seleccionados y revisados.
          </p>
        </div>
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center justify-center rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Consultar por WhatsApp
        </a>
      </div>
    </footer>
  );
}
