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
  Calculator,
  Smartphone,
  Store,
  X,
  LogOut,
} from "lucide-react";
import { signOut } from "@/lib/auth/actions";
import { cn } from "@/components/ui";
import { PUBLIC_CATALOG_ORIGIN } from "@/lib/domains";

const nav = [
  { href: "/", label: "Inicio", icon: LayoutDashboard },
  { href: "/inventario", label: "Inventario", icon: Package },
  { href: "/agregar", label: "Agregar equipo", icon: PlusCircle },
  { href: "/vendidos", label: "Vendidos", icon: ShoppingBag },
  { href: "/listas", label: "Listas", icon: List },
  { href: PUBLIC_CATALOG_ORIGIN, label: "Publicados", icon: Store, external: true },
  { href: "/cotizador", label: "Cotizador", icon: Calculator },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];

function isActive(pathname: string, href: string, external?: boolean) {
  if (external) return false;
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

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
          "fixed inset-0 z-[90] bg-black/50 transition-opacity lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        id="mobile-sidebar"
        className={cn(
          "fixed inset-y-3 left-3 z-[100] flex w-[min(260px,85vw)] flex-col rounded-[28px] bg-[#101816] px-4 py-5 text-white shadow-2xl transition-transform duration-200 ease-out lg:hidden",
          open ? "translate-x-0" : "-translate-x-[120%]",
        )}
      >
        <div className="mb-6 flex items-start justify-between px-1">
          <Brand />
          <button
            type="button"
            className="rounded-lg p-1 text-white/60 hover:bg-white/10 hover:text-white"
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={isActive(pathname, item.href, item.external)}
              onClick={onClose}
              labeled
            />
          ))}
        </nav>
        <form action={signOut} className="mt-4">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </form>
      </aside>

      <div className="relative hidden w-[76px] shrink-0 lg:block">
        <aside className="admin-rail absolute inset-y-0 left-0 z-40 flex h-[calc(100dvh-2rem)] flex-col overflow-hidden py-4 text-white">
          <Link
            href="/"
            title="Inicio"
            className="admin-rail-brand mb-5 flex h-11 items-center overflow-hidden rounded-2xl bg-white text-[#101816]"
          >
            <Smartphone className="h-5 w-5 shrink-0" />
            <span className="admin-rail-label text-sm font-semibold">Stock Apple</span>
          </Link>
          <nav className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto px-2.5">
            {nav.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={isActive(pathname, item.href, item.external)}
                rail
              />
            ))}
          </nav>
          <form action={signOut} className="mt-3 px-2.5">
            <button
              type="submit"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              className="admin-rail-item flex h-11 w-full items-center overflow-hidden rounded-2xl text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-[18px] w-[18px] shrink-0" />
              <span className="admin-rail-label text-sm font-medium">Cerrar sesión</span>
            </button>
          </form>
        </aside>
      </div>
    </>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#101816]">
        <Smartphone className="h-5 w-5" />
      </div>
      <div>
        <div className="text-base font-semibold">Stock Apple</div>
        <div className="text-[11px] font-medium tracking-[0.18em] text-white/50">
          USADOS
        </div>
      </div>
    </div>
  );
}

function NavLink({
  item,
  active,
  onClick,
  labeled = false,
  rail = false,
}: {
  item: (typeof nav)[number];
  active: boolean;
  onClick?: () => void;
  labeled?: boolean;
  rail?: boolean;
}) {
  const Icon = item.icon;
  const className = cn(
    "flex items-center rounded-2xl transition-colors",
    labeled && "justify-start gap-3 px-3 py-2.5 text-sm font-medium",
    rail && "admin-rail-item h-11 w-full overflow-hidden text-sm font-medium",
    !labeled && !rail && "h-11 w-11 justify-center",
    active
      ? "bg-white text-[#101816] hover:bg-white"
      : "text-white/70 hover:bg-white/10 hover:text-white",
  );
  const content = (
    <>
      <Icon className="h-[18px] w-[18px] shrink-0" />
      {labeled ? item.label : null}
      {rail ? <span className="admin-rail-label">{item.label}</span> : null}
      {!labeled && !rail ? <span className="sr-only">{item.label}</span> : null}
    </>
  );

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        title={item.label}
        onClick={onClick}
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={item.href} title={item.label} onClick={onClick} className={className}>
      {content}
    </Link>
  );
}
