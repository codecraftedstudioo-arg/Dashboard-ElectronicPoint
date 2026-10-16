import { compareIphoneModelsDesc } from "@/lib/iphone-model-sort";
import { primaryImageUrl } from "@/lib/images";
import { prisma } from "@/lib/prisma";
import { buildProductSlug, parseProductIdFromSlug } from "@/lib/product-slug";
import type { PublicTradeTarget, TradeOption } from "@/lib/cotizador/types";

export type { TradeOption };

type TradeProductRow = {
  type: string;
  status: string;
  isPublished: boolean;
  isReserved: boolean;
  name: string;
  storage: string;
  color: string;
  salePrice: number;
  batteryCondition?: number | null;
  cost?: number;
  imei?: string | null;
  internalCode?: string;
};

/** Public canje target, or null when the product cannot be offered. */
export function toPublicTradeTarget(
  product: TradeProductRow | null,
): PublicTradeTarget | null {
  if (!product) return null;
  if (product.type !== "IPHONE") return null;
  if (product.status !== "AVAILABLE") return null;
  if (!product.isPublished) return null;
  if (product.isReserved) return null;

  return {
    name: product.name,
    storage: product.storage,
    color: product.color,
    salePrice: product.salePrice,
    batteryCondition: product.batteryCondition ?? null,
  };
}

export async function resolveTradeTarget(
  equipo: string | undefined,
): Promise<PublicTradeTarget | null> {
  if (!equipo) return null;
  const id = parseProductIdFromSlug(equipo);
  if (!id) return null;

  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      type: true,
      status: true,
      isPublished: true,
      isReserved: true,
      name: true,
      storage: true,
      color: true,
      salePrice: true,
      batteryCondition: true,
    },
  });

  return toPublicTradeTarget(product);
}

/** Published, available, unreserved iPhones. Prices come from the database. */
export async function listEligibleTradeOptions(): Promise<TradeOption[]> {
  const products = await prisma.product.findMany({
    where: {
      type: "IPHONE",
      status: "AVAILABLE",
      isPublished: true,
      isReserved: false,
    },
    select: {
      id: true,
      name: true,
      storage: true,
      color: true,
      salePrice: true,
      batteryCondition: true,
      isReserved: true,
      images: {
        select: { url: true, isPrimary: true, sortOrder: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return products
    .map((product) => {
      const target = toPublicTradeTarget({
        type: "IPHONE",
        status: "AVAILABLE",
        isPublished: true,
        isReserved: product.isReserved,
        name: product.name,
        storage: product.storage,
        color: product.color,
        salePrice: product.salePrice,
        batteryCondition: product.batteryCondition,
      });
      if (!target) return null;
      return {
        ...target,
        slug: buildProductSlug(product),
        imageUrl: primaryImageUrl(product.images),
      };
    })
    .filter((option): option is TradeOption => option !== null)
    .sort(
      (a, b) =>
        compareIphoneModelsDesc(a.name, b.name) ||
        a.storage.localeCompare(b.storage, "es"),
    );
}
