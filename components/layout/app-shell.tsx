"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  Calculator,
  LayoutDashboard,
  List,
  Menu,
  Package,
  Plus,
  Search,
  ShoppingBag,
} from "lucide-react";
import {
  CurrencyToggle,
  ExchangeRateBadge,
} from "@/components/currency/currency-toggle";
import { Sidebar } from "@/components/layout/sidebar";
import { cn } from "@/components/ui";

const tabs = [
  { href: "/", label: "Inicio", icon: LayoutDashboard },
  { href: "/inventario", label: "Inventario", icon: Package },
  { href: "/vendidos", label: "Vendidos", icon: ShoppingBag },
  { href: "/listas", label: "Listas", icon: List },
  { href: "/cotizador", label: "Cotizador", icon: Calculator },
];

export function AppShell({
  children,
  isCatalogSite = false,
}: {
  children: ReactNode;
  isCatalogSite?: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const home = pathname === "/";

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (isCatalogSite || pathname === "/ingresar") {
    return <>{children}</>;
  }

  return (
    <div className="admin-canvas flex min-h-screen gap-3 p-3 text-foreground lg:p-4">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="admin-panel flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 px-3 py-3 text-white sm:px-5">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="rounded-2xl border border-white/10 p-2 text-white lg:hidden"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="mobile-sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/" className="hidden items-center gap-2 pr-1 sm:flex">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-[#101816]">
              <Package className="h-4 w-4" />
            </span>
          </Link>
          <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const active =
                tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium",
                    active
                      ? "bg-white text-[#101816]"
                      : "text-white/70 hover:text-white",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </Link>
              );
            })}
          </nav>
          <HeaderSearch />
          {home ? null : <HeaderActions />}
        </header>
        {home ? (
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        ) : (
          <div className="admin-sheet min-h-0 flex-1 overflow-x-hidden px-4 py-5 md:px-6 md:py-6">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

function HeaderSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");

  return (
    <form
      className="relative hidden w-full max-w-[240px] xl:block"
      onSubmit={(event) => {
        event.preventDefault();
        const query = value.trim();
        router.push(
          query ? `/inventario?q=${encodeURIComponent(query)}` : "/inventario",
        );
      }}
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Buscar equipos"
        aria-label="Buscar equipos"
        className="w-full rounded-full border border-white/10 bg-white/5 py-2 pr-3 pl-9 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/30"
      />
    </form>
  );
}

function HeaderActions() {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <CurrencyToggle compact tone="onDark" />
      <AddProductLink />
    </div>
  );
}

export function AddProductLink({ className }: { className?: string }) {
  return (
    <Link
      href="/agregar"
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-[#3dde84] px-4 py-2.5 text-sm font-semibold text-[#06281c] shadow-[0_8px_22px_rgba(61,222,132,0.35)] hover:bg-[#2ed276]",
        className,
      )}
    >
      <Plus className="h-4 w-4" />
      <span className="hidden sm:inline">Agregar equipo</span>
      <span className="sm:hidden">Agregar</span>
    </Link>
  );
}

/** Alias used by page headers. */
export function CurrencySelector() {
  return (
    <div className="flex flex-col items-end gap-1">
      <CurrencyToggle />
      <ExchangeRateBadge />
    </div>
  );
}
