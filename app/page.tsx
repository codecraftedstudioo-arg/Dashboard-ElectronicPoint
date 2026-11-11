import { Package, DollarSign, Tag, TrendingUp } from "lucide-react";
import { AddProductLink } from "@/components/layout/app-shell";
import { CurrencyToggle, ExchangeRateBadge } from "@/components/currency/currency-toggle";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  RecentProductsCard,
  RecentSalesCard,
} from "@/components/dashboard/recent-lists";
import {
  FinancialSummaryChart,
  ChannelSalesChart,
} from "@/components/dashboard/charts";
import { ListGenerator } from "@/components/lists/list-generator";
import { Money } from "@/components/currency/currency-toggle";
import {
  getAvailableProducts,
  getDashboardStats,
  getRecentSales,
} from "@/lib/queries";
import { requireDashboardPage } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await requireDashboardPage();
  const [available, sales, stats] = await Promise.all([
    getAvailableProducts(),
    getRecentSales(6),
    getDashboardStats(),
  ]);

  const recentProducts = available.slice(0, 6);
  const period = new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
  }).format(new Date());
  const listProducts = available.map((p) => ({
    id: p.id,
    name: p.name,
    storage: p.storage,
    color: p.color,
    batteryCondition: p.batteryCondition,
    physicalCondition: p.physicalCondition,
    salePrice: p.salePrice,
    type: p.type,
    createdAt: p.createdAt,
  }));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <section className="px-4 pt-1 pb-5 text-white sm:px-6 sm:pb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
              Stock Apple
            </h1>
            <p className="mt-1 text-sm text-white/55">
              Mostrando el inventario de {period}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-col items-end gap-1">
              <CurrencyToggle compact tone="onDark" />
              <ExchangeRateBadge className="text-white/50" />
            </div>
            <AddProductLink />
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            variant="glass"
            title="Equipos disponibles"
            value={`${stats.totalAvailable} equipos`}
            subtitle="Stock actual"
            icon={<Package className="h-5 w-5" />}
          />
          <StatCard
            variant="glass"
            title="Costo del stock"
            value={<Money amount={stats.totalCost} />}
            subtitle="Dinero invertido"
            icon={<DollarSign className="h-5 w-5" />}
          />
          <StatCard
            variant="glass"
            title="Valor de venta"
            value={<Money amount={stats.totalSaleValue} />}
            subtitle="Precio de venta total"
            icon={<Tag className="h-5 w-5" />}
          />
          <StatCard
            variant="glass"
            title="Ganancia potencial"
            value={<Money amount={stats.potentialProfit} />}
            subtitle="Podrías ganar"
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </div>
      </section>

      <section className="admin-sheet flex-1 space-y-4 px-4 py-5 md:px-6">
        <div className="grid gap-4 xl:grid-cols-2">
          <FinancialSummaryChart
            totalCost={stats.totalCost}
            potentialProfit={stats.potentialProfit}
            realizedProfit={stats.realizedProfit}
            totalRevenue={stats.totalRevenue}
          />
          <ChannelSalesChart
            channelCounts={stats.channelCounts}
            total={stats.channelTotal}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <RecentProductsCard
            products={recentProducts}
            total={stats.totalAvailable}
          />
          <RecentSalesCard sales={sales} />
        </div>

        <ListGenerator products={listProducts} />
      </section>
    </div>
  );
}
