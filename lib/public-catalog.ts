import { prisma } from "@/lib/prisma";
import { compareIphoneModelsDesc } from "@/lib/iphone-model-sort";
import type { ChipType, PhysicalCondition, Prisma } from "@prisma/client";

/** Public-facing product shape — never includes cost, IMEI, or internal codes. */
export type PublicCatalogProduct = {
  id: string;
  name: string;
  storage: string;
  color: string;
  batteryCondition: number | null;
  physicalCondition: PhysicalCondition;
  chip: ChipType | null;
  salePrice: number;
  description: string | null;
  images: {
    id: string;
    url: string;
    isPrimary: boolean;
    sortOrder: number;
  }[];
};

const publicProductSelect = {
  id: true,
  name: true,
  storage: true,
  color: true,
  batteryCondition: true,
  physicalCondition: true,
  chip: true,
  salePrice: true,
  description: true,
  images: {
    select: {
      id: true,
      url: true,
      isPrimary: true,
      sortOrder: true,
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  },
} satisfies Prisma.ProductSelect;

export type PublicCatalogFilters = {
  search?: string;
  storage?: string;
  sort?: "price-asc" | "price-desc" | "battery" | "newest";
};

export async function getPublishedIphones(
  filters?: PublicCatalogFilters,
): Promise<PublicCatalogProduct[]> {
  const search = filters?.search?.trim();

  const products = await prisma.product.findMany({
    where: {
      status: "AVAILABLE",
      isPublished: true,
      type: "IPHONE",
      ...(filters?.storage ? { storage: filters.storage } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { storage: { contains: search, mode: "insensitive" } },
              { color: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: publicProductSelect,
    orderBy: { createdAt: "desc" },
  });

  const sorted = [...products];
  switch (filters?.sort) {
    case "price-asc":
      sorted.sort((a, b) => a.salePrice - b.salePrice);
      break;
    case "price-desc":
      sorted.sort((a, b) => b.salePrice - a.salePrice);
      break;
    case "battery":
      sorted.sort(
        (a, b) => (b.batteryCondition ?? 0) - (a.batteryCondition ?? 0),
      );
      break;
    default:
      sorted.sort((a, b) => compareIphoneModelsDesc(a.name, b.name));
      break;
  }

  return sorted;
}

export async function getPublishedIphoneById(
  id: string,
): Promise<PublicCatalogProduct | null> {
  return prisma.product.findFirst({
    where: {
      id,
      status: "AVAILABLE",
      isPublished: true,
      type: "IPHONE",
    },
    select: publicProductSelect,
  });
}

export type CatalogNeighbor = {
  id: string;
  name: string;
  storage: string;
};

export async function getPublishedIphoneNeighbors(
  id: string,
): Promise<{ prev: CatalogNeighbor | null; next: CatalogNeighbor | null }> {
  const products = await getPublishedIphones();
  const index = products.findIndex((p) => p.id === id);
  if (index < 0) return { prev: null, next: null };

  const toNeighbor = (p: PublicCatalogProduct): CatalogNeighbor => ({
    id: p.id,
    name: p.name,
    storage: p.storage,
  });

  return {
    prev: index > 0 ? toNeighbor(products[index - 1]) : null,
    next: index < products.length - 1 ? toNeighbor(products[index + 1]) : null,
  };
}

export async function getPublishedModelNames(): Promise<string[]> {
  const rows = await prisma.product.findMany({
    where: {
      status: "AVAILABLE",
      isPublished: true,
      type: "IPHONE",
    },
    select: { name: true },
    distinct: ["name"],
  });
  return rows
    .map((r) => r.name)
    .sort(compareIphoneModelsDesc);
}

export type CatalogModelGroup = {
  model: string;
  products: PublicCatalogProduct[];
};

function storageRank(storage: string): number {
  const s = storage.replace(/\s/g, "").toUpperCase();
  const n = parseFloat(s);
  if (Number.isNaN(n)) return 0;
  return s.includes("TB") ? n * 1024 : n;
}

/** Group published units by model name, newest models first. Each product appears once. */
export function groupPublishedIphonesByModel(
  products: PublicCatalogProduct[],
  options?: { preserveOrder?: boolean },
): CatalogModelGroup[] {
  const map = new Map<string, PublicCatalogProduct[]>();
  for (const product of products) {
    const list = map.get(product.name);
    if (list) list.push(product);
    else map.set(product.name, [product]);
  }

  if (options?.preserveOrder) {
    return [...map.entries()].map(([model, units]) => ({
      model,
      products: units,
    }));
  }

  return [...map.keys()]
    .sort(compareIphoneModelsDesc)
    .map((model) => {
      const units = [...(map.get(model) ?? [])].sort((a, b) => {
        const byStorage = storageRank(a.storage) - storageRank(b.storage);
        if (byStorage !== 0) return byStorage;
        const byColor = a.color.localeCompare(b.color, "es");
        if (byColor !== 0) return byColor;
        return a.salePrice - b.salePrice;
      });
      return { model, products: units };
    });
}
