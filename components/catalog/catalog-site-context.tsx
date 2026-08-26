"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import {
  catalogEquiposPath,
  catalogHomePath,
  catalogProductPath,
} from "@/lib/domains";

type CatalogSiteContextValue = {
  isCatalogSite: boolean;
  homePath: string;
  equiposPath: string;
  productPath: (slug: string) => string;
};

const CatalogSiteContext = createContext<CatalogSiteContextValue>({
  isCatalogSite: false,
  homePath: "/usados",
  equiposPath: "/usados#equipos",
  productPath: (slug) => `/usados/${slug.replace(/^\/+/, "")}`,
});

export function CatalogSiteProvider({
  isCatalogSite,
  children,
}: {
  isCatalogSite: boolean;
  children: ReactNode;
}) {
  const value: CatalogSiteContextValue = {
    isCatalogSite,
    homePath: catalogHomePath(isCatalogSite),
    equiposPath: catalogEquiposPath(isCatalogSite),
    productPath: (slug) => catalogProductPath(slug, isCatalogSite),
  };

  return (
    <CatalogSiteContext.Provider value={value}>
      {children}
    </CatalogSiteContext.Provider>
  );
}

export function useCatalogSite() {
  return useContext(CatalogSiteContext);
}
