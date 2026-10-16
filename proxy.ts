import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isDashboardAdminPath, safeNextPath } from "@/lib/auth/routes";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session-token";
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
 *
 * Admin pages on the dashboard host require a signed HttpOnly session.
 * The public catalog and quote API do not.
 */
function redirectHome(request: NextRequest, status: 307 | 308) {
  const url = request.nextUrl.clone();
  url.pathname = "/";
  return NextResponse.redirect(url, status);
}

export async function proxy(request: NextRequest) {
  const host = hostFromHeaders(request.headers) || request.nextUrl.host;
  const { pathname } = request.nextUrl;
  const catalog = isCatalogHost(host);
  const needsSession =
    !catalog && (isDashboardAdminPath(pathname) || pathname === "/ingresar");
  const isAdmin = needsSession
    ? await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value)
    : false;
  // The catalog rewrite is fetched again by the server. That internal request
  // must render /usados instead of redirecting the public URL.
  const internalCatalogRewrite = request.headers.get("x-catalog-site") === "1";

  if (!catalog && isDashboardAdminPath(pathname) && !isAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = "/ingresar";
    url.search = "";
    const next = `${pathname}${request.nextUrl.search}`;
    if (next !== "/") url.searchParams.set("next", next);
    return NextResponse.redirect(url);
  }

  if (!catalog && pathname === "/ingresar" && isAdmin) {
    const url = request.nextUrl.clone();
    const next = safeNextPath(request.nextUrl.searchParams.get("next"));
    const queryIndex = next.indexOf("?");
    url.pathname = queryIndex === -1 ? next : next.slice(0, queryIndex);
    url.search = queryIndex === -1 ? "" : next.slice(queryIndex);
    return NextResponse.redirect(url);
  }

  if (internalCatalogRewrite && isUsadosPath(pathname)) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-catalog-site", "1");
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (!catalog) {
    if (isUsadosPath(pathname)) {
      return redirectHome(request, 308);
    }
    return NextResponse.next();
  }

  if (pathname === "/usados" || pathname === "/usados/") {
    return redirectHome(request, 308);
  }

  if (pathname.startsWith("/usados/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice("/usados".length) || "/";
    return NextResponse.redirect(url, 308);
  }

  if (isDashboardPath(pathname)) {
    return redirectHome(request, 307);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-catalog-site", "1");

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/usados";
    return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const url = request.nextUrl.clone();
  url.pathname = `/usados${pathname}`;
  return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
