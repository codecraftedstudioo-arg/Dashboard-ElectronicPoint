"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, Input, Select, Badge } from "@/components/ui";
import { formatUSD } from "@/lib/currency";
import { calcProfit } from "@/lib/calculations";
import {
  CHANNEL_COLORS,
  SALE_CHANNEL_LABELS,
  PRODUCT_TYPE_LABELS,
} from "@/lib/constants";
import { primaryImageUrl } from "@/lib/images";
import { ChannelSalesChart } from "@/components/dashboard/charts";
import type { SaleChannel, ProductType } from "@prisma/client";
import { DollarSign, Package, TrendingUp, ChartPie } from "lucide-react";
import { StatCard as MetricCard } from "@/components/dashboard/stat-card";

type SaleRow = {
  id: string;
  soldPrice: number;
  channel: SaleChannel;
  soldAt: Date | string;
  product: {
    id: string;
    name: string;
    storage: string;
    type: ProductType;
    cost: number;
    images: { url: string; isPrimary: boolean }[];
  };
};

export function SoldPageClient({
  sales,
  channelCounts,
  channelTotal,
}: {
  sales: SaleRow[];
  channelCounts: Record<string, number>;
  channelTotal: number;
}) {
  const [channel, setChannel] = useState("ALL");
  const [type, setType] = useState("ALL");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = useMemo(() => {
    return sales.filter((sale) => {
      if (channel !== "ALL" && sale.channel !== channel) return false;
      if (type !== "ALL" && sale.product.type !== type) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!sale.product.name.toLowerCase().includes(q)) return false;
      }
      const soldAt = new Date(sale.soldAt);
      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        if (soldAt < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (soldAt > to) return false;
      }
      return true;
    });
  }, [sales, channel, type, search, dateFrom, dateTo]);

  const soldCount = filtered.length;
  const revenue = filtered.reduce((s, sale) => s + sale.soldPrice, 0);
  const profit = filtered.reduce(
    (s, sale) => s + calcProfit(sale.soldPrice, sale.product.cost),
    0,
  );
  const avg = soldCount ? profit / soldCount : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Equipos vendidos"
          value={`${soldCount}`}
          subtitle="Historial filtrado"
          icon={<Package className="h-5 w-5" />}
          iconClassName="bg-accent-dim text-accent"
        />
        <MetricCard
          title="Facturación total"
          value={formatUSD(revenue)}
          subtitle="Suma de ventas"
          icon={<DollarSign className="h-5 w-5" />}
          iconClassName="bg-blue-500/15 text-blue-400"
        />
        <MetricCard
          title="Ganancia total"
          value={formatUSD(profit)}
          subtitle="Ganancia real"
          icon={<TrendingUp className="h-5 w-5" />}
          iconClassName="bg-violet-500/15 text-violet-400"
        />
        <MetricCard
          title="Ganancia promedio"
          value={formatUSD(avg)}
          subtitle="Por equipo"
          icon={<ChartPie className="h-5 w-5" />}
          iconClassName="bg-pink-500/15 text-pink-400"
        />
      </div>

      <ChannelSalesChart channelCounts={channelCounts} total={channelTotal} />

      <Card className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Input
            placeholder="Buscar modelo"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={channel} onChange={(e) => setChannel(e.target.value)}>
            <option value="ALL">Canal: todos</option>
            {Object.entries(SALE_CHANNEL_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="ALL">Tipo: todos</option>
            <option value="IPHONE">iPhone</option>
            <option value="MACBOOK">MacBook</option>
          </Select>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            aria-label="Desde"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            aria-label="Hasta"
          />
        </div>
      </Card>

      <div className="space-y-3">
        {filtered.map((sale) => {
          const img = primaryImageUrl(sale.product.images);
          const realProfit = calcProfit(sale.soldPrice, sale.product.cost);
          return (
            <Link key={sale.id} href={`/equipos/${sale.product.id}`}>
              <Card className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-input">
                    {img ? (
                      <Image src={img} alt={sale.product.name} fill className="object-cover" unoptimized />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-foreground">
                      {sale.product.name} {sale.product.storage}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted">
                      <span>{PRODUCT_TYPE_LABELS[sale.product.type]}</span>
                      <Badge className={CHANNEL_COLORS[sale.channel]}>
                        {SALE_CHANNEL_LABELS[sale.channel]}
                      </Badge>
                      <span>
                        {new Date(sale.soldAt).toLocaleDateString("es-AR")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm sm:w-[320px]">
                  <div>
                    <div className="text-xs text-muted">Costo</div>
                    <div>{formatUSD(sale.product.cost)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted">Final</div>
                    <div>{formatUSD(sale.soldPrice)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted">Ganancia</div>
                    <div className="text-accent">{formatUSD(realProfit)}</div>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
