"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { Menu, Plus } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button, Select } from "@/components/ui";

export function AppShell({
  children,
  isCatalogSite = false,
}: {
  children: ReactNode;
  isCatalogSite?: boolean;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (isCatalogSite) {
    return <>{children}</>;
  }

  return (
    <div className="relative flex min-h-screen bg-background text-foreground">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-card-border bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="relative z-30 rounded-xl border border-card-border p-2 text-foreground"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="mobile-sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="text-sm font-semibold">Stock Apple</div>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Link href="/agregar">
              <Button className="!px-3 !py-2 text-xs">
                <Plus className="h-4 w-4" />
                Agregar
              </Button>
            </Link>
          </div>
        </div>
        <main className="flex-1 overflow-x-hidden px-4 py-5 md:px-6 md:py-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export function CurrencySelector() {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-card-border bg-card px-3 py-2 text-sm">
      <span className="text-muted">Tipo de cambio</span>
      <span className="text-muted">|</span>
      <Select
        defaultValue="USD"
        aria-label="Moneda"
        className="!w-auto !border-0 !bg-transparent !px-1 !py-0 font-semibold text-foreground !ring-0"
      >
        <option value="USD">USD</option>
      </Select>
    </div>
  );
}
