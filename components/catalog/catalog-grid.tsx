import { CatalogModels } from "@/components/catalog/catalog-models";
import {
  groupPublishedIphonesByModel,
  type PublicCatalogProduct,
} from "@/lib/public-catalog";

export function CatalogGrid({
  products,
}: {
  products: PublicCatalogProduct[];
}) {
  return <CatalogModels groups={groupPublishedIphonesByModel(products)} />;
}
