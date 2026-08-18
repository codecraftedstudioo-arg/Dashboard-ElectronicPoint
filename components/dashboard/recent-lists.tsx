import Image from "next/image";
import Link from "next/link";
import { Battery } from "lucide-react";
import { Badge, Card } from "@/components/ui";
import { formatUSD } from "@/lib/currency";
import { calcProfit } from "@/lib/calculations";
import {
  CONDITION_COLORS,
  PHYSICAL_CONDITION_LABELS,
  CHANNEL_COLORS,
  SALE_CHANNEL_LABELS,
} from "@/lib/constants";
import { primaryImageUrl } from "@/lib/images";
import type { PhysicalCondition, SaleChannel } from "@prisma/client";

function relativeDate(date: Date) {
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startThat = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round(
    (startToday.getTime() - startThat.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  return date.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" });
}

export function RecentProductsCard({
  products,
}: {
  products: Array<{
    id: string;
    name: string;
    storage: string;
    color: string;
    batteryCondition: number | null;
    physicalCondition: PhysicalCondition;
    cost: number;
    salePrice: number;
    images: { url: string; isPrimary: boolean }[];
  }>;
}) {
  return (
    <Card className="h-full">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground md:text-lg">
          Últimos equipos ingresados
        </h2>
        <Link
          href="/inventario"
          className="shrink-0 text-sm font-medium text-accent hover:underline"
        >
          Ver todos
        </Link>
      </div>
      <div className="space-y-1">
        {products.map((product) => {
          const img = primaryImageUrl(product.images);
          const profit = calcProfit(product.salePrice, product.cost);
          return (
            <Link
              key={product.id}
              href={`/equipos/${product.id}`}
              className="flex items-center gap-3 rounded-xl border border-transparent px-2 py-2.5 transition-colors hover:border-card-border hover:bg-white/[0.03]"
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-input">
                {img ? (
                  <Image
                    src={img}
                    alt={product.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-foreground">
                  {product.name}
                </div>
                <div className="truncate text-xs text-muted">
                  {product.storage} {product.color}
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {product.batteryCondition != null ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent-dim px-2 py-0.5 text-[11px] font-medium text-accent">
                      <Battery className="h-3 w-3" />
                      {product.batteryCondition}%
                    </span>
                  ) : null}
                  <Badge className={CONDITION_COLORS[product.physicalCondition]}>
                    {PHYSICAL_CONDITION_LABELS[product.physicalCondition]}
                  </Badge>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-sm font-medium text-foreground">
                  {formatUSD(product.salePrice)}
                </div>
                <div className="mt-0.5 text-[11px] text-muted">Venta</div>
                <div className="mt-1 text-xs font-medium text-accent">
                  {formatUSD(profit)}
                </div>
                <div className="text-[11px] text-muted">Ganancia</div>
              </div>
            </Link>
          );
        })}
        {!products.length ? (
          <p className="px-2 text-sm text-muted">No hay equipos disponibles.</p>
        ) : null}
      </div>
    </Card>
  );
}

export function RecentSalesCard({
  sales,
}: {
  sales: Array<{
    id: string;
    soldPrice: number;
    channel: SaleChannel;
    soldAt: Date;
    product: {
      id: string;
      name: string;
      storage: string;
      cost: number;
      images: { url: string; isPrimary: boolean }[];
    };
  }>;
}) {
  return (
    <Card className="h-full">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground md:text-lg">
          Ventas recientes
        </h2>
        <Link
          href="/vendidos"
          className="shrink-0 text-sm font-medium text-accent hover:underline"
        >
          Ver todas
        </Link>
      </div>
      <div className="space-y-1">
        {sales.map((sale) => {
          const img = primaryImageUrl(sale.product.images);
          const profit = calcProfit(sale.soldPrice, sale.product.cost);
          return (
            <Link
              key={sale.id}
              href={`/equipos/${sale.product.id}`}
              className="flex items-center gap-3 rounded-xl border border-transparent px-2 py-2.5 transition-colors hover:border-card-border hover:bg-white/[0.03]"
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-input">
                {img ? (
                  <Image
                    src={img}
                    alt={sale.product.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-foreground">
                  {sale.product.name}
                </div>
                <div className="truncate text-xs text-muted">
                  {sale.product.storage}
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
                  <Badge className={CHANNEL_COLORS[sale.channel]}>
                    {SALE_CHANNEL_LABELS[sale.channel]}
                  </Badge>
                  <span className="text-muted">{relativeDate(sale.soldAt)}</span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-sm font-medium text-foreground">
                  {formatUSD(sale.soldPrice)}
                </div>
                <div className="mt-1 text-xs font-medium text-accent">
                  {formatUSD(profit)}
                </div>
              </div>
            </Link>
          );
        })}
        {!sales.length ? (
          <p className="px-2 text-sm text-muted">Todavía no hay ventas.</p>
        ) : null}
      </div>
    </Card>
  );
}
