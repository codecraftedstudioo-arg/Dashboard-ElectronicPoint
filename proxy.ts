import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  hostFromHeaders,
  isCatalogHost,
  isDashboardPath,
  isUsadosPath,
} from "@/lib/domains";

/**
 * Hostname-based routing:
 * - Dashboard host (electronicpoint-inventario.com.ar, localhost, …)
 *   → admin app. /usados is never visible; it redirects home.
 * - Catalog host (usadospremium.com.ar)
 *   → public catalog via internal rewrite to /usados.
 */
function redirectHome(request: NextRequest, status: 307 | 308) {
  const url = request.nextUrl.clone();
  url.pathname = "/";
  return NextResponse.redirect(url, status);
}

export function proxy(request: NextRequest) {
  const host = hostFromHeaders(request.headers) || request.nextUrl.host;
  const { pathname } = request.nextUrl;

  if (!isCatalogHost(host)) {
    if (isUsadosPath(pathname)) {
      return redirectHome(request, 308);
    }
    return NextResponse.next();
  }

  // Keep /usados out of the public URL: /usados → /
  if (pathname === "/usados" || pathname === "/usados/") {
    return redirectHome(request, 308);
  }

  // /usados/:slug → /:slug
  if (pathname.startsWith("/usados/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice("/usados".length) || "/";
    return NextResponse.redirect(url, 308);
  }

  // Do not expose the admin dashboard on the catalog domain
  if (isDashboardPath(pathname)) {
    return redirectHome(request, 307);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-catalog-site", "1");

  // / → /usados (catalog home)
  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/usados";
    return NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    });
  }

  // Skip Next internals and files with extensions (assets)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // /:slug → /usados/:slug (product detail)
  const url = request.nextUrl.clone();
  url.pathname = `/usados${pathname}`;
  return NextResponse.rewrite(url, {
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    /*
     * Match all pathnames except static assets handled by the matcher exclude.
     * Still skip obvious static prefixes for performance.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
