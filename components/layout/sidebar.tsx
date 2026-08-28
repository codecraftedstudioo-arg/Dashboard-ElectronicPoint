"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  List,
  Settings,
  Smartphone,
  Store,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/components/ui";
import { PUBLIC_CATALOG_ORIGIN } from "@/lib/domains";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventario", label: "Inventario", icon: Package },
  { href: "/agregar", label: "Agregar equipo", icon: PlusCircle },
  { href: "/vendidos", label: "Vendidos", icon: ShoppingBag },
  { href: "/listas", label: "Listas", icon: List },
  { href: PUBLIC_CATALOG_ORIGIN, label: "Publicados", icon: Store, external: true },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar menú"
        className={cn(
          "fixed inset-0 z-[90] bg-black/60 transition-opacity lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        id="mobile-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-[100] flex w-[min(260px,85vw)] flex-col border-r border-card-border bg-sidebar px-4 py-5 shadow-2xl transition-transform duration-200 ease-out",
          "lg:static lg:z-auto lg:w-[260px] lg:translate-x-0 lg:shadow-none",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="mb-8 flex items-start justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-card-border bg-card text-accent">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <div className="text-base font-semibold text-foreground">Stock Apple</div>
              <div className="text-[11px] font-medium tracking-[0.18em] text-muted">
                USADOS
              </div>
            </div>
          </div>
          <button
            type="button"
            className="rounded-lg p-1 text-muted hover:bg-white/5 lg:hidden"
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((item) => {
            const external = "external" in item && item.external;
            const active =
              !external &&
              (item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href));
            const Icon = item.icon;
            const className = cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-accent-dim text-accent"
                : "text-muted hover:bg-hover hover:text-foreground",
            );
            if (external) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className={className}
                >
                  <Icon className="h-4.5 w-4.5" />
                  {item.label}
                </a>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={className}
              >
                <Icon className="h-4.5 w-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-muted">Apariencia</span>
            <ThemeToggle />
          </div>
          <div className="rounded-2xl border border-card-border bg-card p-4">
            <div className="text-xs text-muted">Moneda actual</div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-contrast">
                $
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">USD</div>
                <div className="text-xs text-muted">Dólar estadounidense</div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
