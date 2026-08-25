import { prisma } from "@/lib/prisma";
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

export async function getPublishedModelNames(): Promise<string[]> {
  const rows = await prisma.product.findMany({
    where: {
      status: "AVAILABLE",
      isPublished: true,
      type: "IPHONE",
    },
    select: { name: true },
    distinct: ["name"],
    orderBy: { name: "asc" },
  });
  return rows.map((r) => r.name);
}
