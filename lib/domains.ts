/** Hostnames for the public used-iPhone catalog site. */
const CATALOG_HOSTS = new Set([
  "usadospremium.com.ar",
  "www.usadospremium.com.ar",
]);

/** Optional comma-separated extra hosts (e.g. local testing). */
function extraCatalogHosts(): Set<string> {
  const raw = process.env.CATALOG_HOSTS?.trim();
  if (!raw) return new Set();
  return new Set(
    raw
      .split(",")
      .map((h) => h.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function normalizeHost(host: string | null | undefined): string {
  if (!host) return "";
  return host.split(":")[0].trim().toLowerCase();
}

export function isCatalogHost(host: string | null | undefined): boolean {
  const h = normalizeHost(host);
  if (!h) return false;
  return CATALOG_HOSTS.has(h) || extraCatalogHosts().has(h);
}

/** Dashboard (and other non-catalog) path prefixes on the public catalog host. */
export const DASHBOARD_PATH_PREFIXES = [
  "/inventario",
  "/agregar",
  "/vendidos",
  "/listas",
  "/configuracion",
  "/equipos",
] as const;

export function isDashboardPath(pathname: string): boolean {
  if (pathname === "/") return false;
  return DASHBOARD_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function catalogHomePath(isCatalogSite: boolean): string {
  return isCatalogSite ? "/" : "/usados";
}

export function catalogProductPath(
  slug: string,
  isCatalogSite: boolean,
): string {
  const clean = slug.replace(/^\/+/, "");
  return isCatalogSite ? `/${clean}` : `/usados/${clean}`;
}

export function catalogEquiposPath(isCatalogSite: boolean): string {
  return isCatalogSite ? "/#equipos" : "/usados#equipos";
}
