import { ThemeToggle } from "@/components/theme/theme-toggle";

export function CatalogHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-card-border/80 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <nav className="hidden items-center gap-6 text-sm text-muted sm:flex">
          <a href="/usados#equipos" className="transition-colors hover:text-foreground">
            iPhones usados
          </a>
        </nav>
        <div className="ml-auto">
          <ThemeToggle />
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
      </div>
    </footer>
  );
}
