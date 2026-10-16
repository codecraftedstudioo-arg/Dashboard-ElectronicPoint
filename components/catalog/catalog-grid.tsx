"use client";

import { useMemo } from "react";
import { CatalogModels } from "@/components/catalog/catalog-models";
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
  const groups = useMemo(() => {
    const list = [...products].sort((a, b) =>
      compareIphoneModelsDesc(a.name, b.name),
    );
    return groupPublishedIphonesByModel(list, { preserveOrder: true });
  }, [products]);

  return (
    <div className="min-w-0">
      <CatalogModels groups={groups} />
    </div>
  );
}
