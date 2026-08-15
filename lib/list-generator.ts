import { formatListPrice } from "@/lib/currency";
import type { ListFieldKey, ListSortOption } from "@/lib/constants";
import { PHYSICAL_CONDITION_LABELS } from "@/lib/constants";
import type { PhysicalCondition, ProductType } from "@prisma/client";

export type ListProduct = {
  id: string;
  name: string;
  storage: string;
  color: string;
  batteryCondition: number | null;
  physicalCondition: PhysicalCondition;
  salePrice: number;
  type: ProductType;
  createdAt: Date | string;
};

export type ListGeneratorOptions = {
  title: string;
  subtitle: string;
  fields: Record<ListFieldKey, boolean>;
  sort: ListSortOption;
  select: "available" | "all" | "manual" | "iphone" | "macbook" | "model";
  modelFilter?: string;
  selectedIds?: string[];
};

export function filterProductsForList(
  products: ListProduct[],
  options: Pick<ListGeneratorOptions, "select" | "modelFilter" | "selectedIds">,
): ListProduct[] {
  let result = [...products];

  switch (options.select) {
    case "iphone":
      result = result.filter((p) => p.type === "IPHONE");
      break;
    case "macbook":
      result = result.filter((p) => p.type === "MACBOOK");
      break;
    case "model":
      if (options.modelFilter?.trim()) {
        const q = options.modelFilter.trim().toLowerCase();
        result = result.filter((p) => p.name.toLowerCase().includes(q));
      }
      break;
    case "manual":
      if (options.selectedIds?.length) {
        const set = new Set(options.selectedIds);
        result = result.filter((p) => set.has(p.id));
      }
      break;
    case "available":
    case "all":
    default:
      break;
  }

  return result;
}

export function sortProductsForList(
  products: ListProduct[],
  sort: ListSortOption,
): ListProduct[] {
  const sorted = [...products];
  const storageRank = (s: string) => {
    const n = parseInt(s.replace(/\D/g, ""), 10) || 0;
    return s.toUpperCase().includes("TB") ? n * 1024 : n;
  };

  switch (sort) {
    case "model-asc":
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "model-desc":
      sorted.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "price-asc":
      sorted.sort((a, b) => a.salePrice - b.salePrice);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.salePrice - a.salePrice);
      break;
    case "storage":
      sorted.sort((a, b) => storageRank(b.storage) - storageRank(a.storage));
      break;
    case "battery":
      sorted.sort(
        (a, b) => (b.batteryCondition ?? -1) - (a.batteryCondition ?? -1),
      );
      break;
    case "newest":
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      break;
    case "oldest":
      sorted.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
      break;
  }

  return sorted;
}

function buildLine(product: ListProduct, fields: Record<ListFieldKey, boolean>): string {
  const parts: string[] = [];

  if (fields.modelStorage || fields.color) {
    const boldParts: string[] = [];
    if (fields.modelStorage) {
      boldParts.push(product.name, product.storage.replace(/\s/g, ""));
    }
    if (fields.color) boldParts.push(product.color);
    parts.push(`*${boldParts.join(" ")}*`);
  }

  if (fields.battery && product.batteryCondition != null) {
    parts.push(`🔋 ${product.batteryCondition}%`);
  }

  if (fields.price) {
    parts.push(formatListPrice(product.salePrice));
  }

  if (fields.condition) {
    parts.push(PHYSICAL_CONDITION_LABELS[product.physicalCondition]);
  }

  return `• ${parts.join(" ")}`;
}

export function generateEquipmentList(
  products: ListProduct[],
  options: ListGeneratorOptions,
): string {
  const filtered = filterProductsForList(products, options);
  const sorted = sortProductsForList(filtered, options.sort);
  const lines = sorted.map((p) => buildLine(p, options.fields));

  return [options.title, "", options.subtitle, "", ...lines].join("\n");
}
