import { prisma } from "@/lib/prisma";
import { calcProfit } from "@/lib/calculations";
import type { Prisma, ProductStatus, SaleChannel } from "@prisma/client";

export const productImagesInclude = {
  orderBy: [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }],
};

export async function nextInternalCode(): Promise<string> {
  const counter = await prisma.appCounter.upsert({
    where: { id: "product" },
    create: { id: "product", value: 1 },
    update: { value: { increment: 1 } },
  });
  return `EP-${String(counter.value).padStart(4, "0")}`;
}

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: { images: true; sale: true };
}>;

export async function getAvailableProducts() {
  return prisma.product.findMany({
    where: { status: "AVAILABLE" },
    include: { images: productImagesInclude, sale: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAllProducts(filters?: {
  status?: ProductStatus;
  search?: string;
  type?: "IPHONE" | "MACBOOK";
}) {
  const where: Prisma.ProductWhereInput = {};
  if (filters?.status) where.status = filters.status;
  if (filters?.type) where.type = filters.type;
  if (filters?.search) {
    const q = filters.search;
    where.OR = [
      { name: { contains: q } },
      { internalCode: { contains: q } },
      { color: { contains: q } },
      { storage: { contains: q } },
      { imei: { contains: q } },
    ];
  }
  return prisma.product.findMany({
    where,
    include: { images: productImagesInclude, sale: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { images: productImagesInclude, sale: true },
  });
}

export async function getRecentSales(limit = 8) {
  return prisma.sale.findMany({
    take: limit,
    orderBy: { soldAt: "desc" },
    include: {
      product: { include: { images: productImagesInclude } },
    },
  });
}

export async function getSales(filters?: {
  channel?: SaleChannel;
  type?: "IPHONE" | "MACBOOK";
  search?: string;
}) {
  const where: Prisma.SaleWhereInput = {};
  if (filters?.channel) where.channel = filters.channel;
  if (filters?.type || filters?.search) {
    where.product = {};
    if (filters.type) where.product.type = filters.type;
    if (filters.search) {
      where.product.OR = [
        { name: { contains: filters.search } },
        { internalCode: { contains: filters.search } },
      ];
    }
  }
  return prisma.sale.findMany({
    where,
    orderBy: { soldAt: "desc" },
    include: {
      product: { include: { images: productImagesInclude } },
    },
  });
}

export async function getDashboardStats() {
  const available = await prisma.product.findMany({
    where: { status: "AVAILABLE" },
    include: { images: productImagesInclude },
  });
  const sales = await prisma.sale.findMany({
    include: { product: true },
  });

  const totalAvailable = available.length;
  const totalCost = available.reduce((s, p) => s + p.cost, 0);
  const totalSaleValue = available.reduce((s, p) => s + p.salePrice, 0);
  const potentialProfit = totalSaleValue - totalCost;

  const realizedProfit = sales.reduce(
    (s, sale) => s + calcProfit(sale.soldPrice, sale.product.cost),
    0,
  );
  const totalRevenue = sales.reduce((s, sale) => s + sale.soldPrice, 0);
  const avgProfit = sales.length ? realizedProfit / sales.length : 0;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentSales = sales.filter((s) => s.soldAt >= thirtyDaysAgo);

  const channelCounts: Record<string, number> = {
    CLIENTE: 0,
    FACEBOOK_MARKETPLACE: 0,
    INSTAGRAM: 0,
    REFERIDO: 0,
    GREMIO: 0,
    OTRO: 0,
  };
  for (const sale of recentSales) {
    channelCounts[sale.channel] = (channelCounts[sale.channel] || 0) + 1;
  }

  return {
    totalAvailable,
    totalCost,
    totalSaleValue,
    potentialProfit,
    realizedProfit,
    totalRevenue,
    soldCount: sales.length,
    avgProfit,
    channelCounts,
    channelTotal: recentSales.length,
  };
}
