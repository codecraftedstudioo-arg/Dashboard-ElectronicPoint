import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  isCatalogHost,
  isDashboardPath,
} from "@/lib/domains";

/**
 * Hostname-based routing for dual domains:
 * - Dashboard host → unchanged (electronicpoint-inventario.com.ar, localhost, etc.)
 * - Catalog host (usadospremium.com.ar) → public /usados mapped to /
 */
export function proxy(request: NextRequest) {
  const host = request.headers.get("host");
  if (!isCatalogHost(host)) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Keep /usados out of the public URL: /usados → /
  if (pathname === "/usados" || pathname === "/usados/") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // /usados/:slug → /:slug
  if (pathname.startsWith("/usados/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice("/usados".length) || "/";
    return NextResponse.redirect(url);
  }

  // Do not expose the admin dashboard on the catalog domain
  if (isDashboardPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
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
