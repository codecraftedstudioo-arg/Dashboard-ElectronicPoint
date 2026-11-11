"use client";

import { useMemo } from "react";
import { CatalogModels } from "@/components/catalog/catalog-models";
import { isVariedOpportunityType } from "@/lib/constants";
import { compareIphoneModelsDesc } from "@/lib/iphone-model-sort";
import {
  groupPublishedIphonesByModel,
  type PublicCatalogProduct,
} from "@/lib/public-catalog";

export function CatalogGrid({
  products,
}: {
  products: PublicCatalogProduct[];
}) {
  const iphones = useMemo(
    () => products.filter((product) => !isVariedOpportunityType(product.type)),
    [products],
  );
  const groups = useMemo(() => {
    const list = [...iphones].sort((a, b) =>
      compareIphoneModelsDesc(a.name, b.name),
    );
    return groupPublishedIphonesByModel(list, { preserveOrder: true });
  }, [iphones]);
  const opportunities = useMemo(
    () => iphones.filter((product) => product.isOpportunity),
    [iphones],
  );
  const variedOpportunities = useMemo(
    () =>
      products
        .filter((product) => isVariedOpportunityType(product.type))
        .sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === "APPLE_WATCH" ? -1 : 1;
          }
          return a.name.localeCompare(b.name, "es");
        }),
    [products],
  );

  return (
    <div className="min-w-0">
      <CatalogModels
        groups={groups}
        opportunities={opportunities}
        variedOpportunities={variedOpportunities}
      />
    </div>
  );
}
