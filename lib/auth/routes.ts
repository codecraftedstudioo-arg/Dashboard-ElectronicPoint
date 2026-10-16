const ADMIN_PREFIXES = [
  "/inventario",
  "/agregar",
  "/vendidos",
  "/listas",
  "/configuracion",
  "/cotizador",
  "/equipos",
] as const;

/** Dashboard pages that show or change private inventory. Catalog routes are not included. */
export function isDashboardAdminPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return ADMIN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/** Only same-origin admin paths can be used after login. */
export function safeNextPath(value: string | null | undefined): string {
  if (!value) return "/";
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/";
  }
  if (value.includes("://")) return "/";
  const path = value.split("?")[0] || "/";
  if (path === "/ingresar" || path.startsWith("/ingresar/")) return "/";
  if (!isDashboardAdminPath(path)) return "/";
  return value;
}
