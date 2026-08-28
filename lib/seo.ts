import type { Metadata } from "next";
import { PUBLIC_CATALOG_ORIGIN } from "@/lib/domains";

export const CATALOG_TITLE = "Usados premium";
export const CATALOG_DESCRIPTION =
  "Catálogo de iPhones usados seleccionados, revisados y con garantía de 90 días.";
export const CATALOG_OG_IMAGE = "/catalog/hero-iphone-pro.jpg";

export const DASHBOARD_TITLE = "Stock Apple USADOS";
export const DASHBOARD_DESCRIPTION =
  "Dashboard interno de inventario de equipos Apple usados";

export function catalogMetadata(): Metadata {
  return {
    metadataBase: new URL(PUBLIC_CATALOG_ORIGIN),
    title: CATALOG_TITLE,
    description: CATALOG_DESCRIPTION,
    applicationName: CATALOG_TITLE,
    openGraph: {
      title: CATALOG_TITLE,
      description: CATALOG_DESCRIPTION,
      url: `${PUBLIC_CATALOG_ORIGIN}/`,
      siteName: CATALOG_TITLE,
      type: "website",
      locale: "es_AR",
      images: [{ url: CATALOG_OG_IMAGE }],
    },
    twitter: {
      card: "summary_large_image",
      title: CATALOG_TITLE,
      description: CATALOG_DESCRIPTION,
      images: [CATALOG_OG_IMAGE],
    },
  };
}

export function dashboardMetadata(): Metadata {
  return {
    metadataBase: new URL("https://electronicpoint-inventario.com.ar"),
    title: DASHBOARD_TITLE,
    description: DASHBOARD_DESCRIPTION,
  };
}

export function catalogProductMetadata({
  title,
  description,
  image,
  url,
}: {
  title: string;
  description: string;
  image?: string | null;
  url?: string;
}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: CATALOG_TITLE,
      type: "website",
      locale: "es_AR",
      ...(image ? { images: [{ url: image }] } : { images: [{ url: CATALOG_OG_IMAGE }] }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image || CATALOG_OG_IMAGE],
    },
  };
}
