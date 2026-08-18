import Link from "next/link";
import { Package, DollarSign, Tag, TrendingUp, Plus } from "lucide-react";
import { PageHeader, Button } from "@/components/ui";
import { CurrencySelector } from "@/components/layout/app-shell";
import { ThemeToggle } from "@/components/theme/theme-toggle";
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
import { formatUSD } from "@/lib/currency";
import {
  getAvailableProducts,
  getDashboardStats,
  getRecentSales,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [available, sales, stats] = await Promise.all([
    getAvailableProducts(),
    getRecentSales(6),
    getDashboardStats(),
  ]);

  const recentProducts = available.slice(0, 6);
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
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Resumen general de tu inventario"
        actions={
          <>
            <ThemeToggle />
            <CurrencySelector />
            <Link href="/agregar">
              <Button>
                <Plus className="h-4 w-4" />
                Agregar equipo
              </Button>
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Equipos disponibles"
          value={`${stats.totalAvailable} equipos`}
          subtitle="Stock actual"
          icon={<Package className="h-5 w-5" />}
          iconClassName="bg-accent-dim text-accent"
        />
        <StatCard
          title="Costo total del stock"
          value={formatUSD(stats.totalCost)}
          subtitle="Dinero invertido"
          icon={<DollarSign className="h-5 w-5" />}
          iconClassName="bg-accent-dim text-accent"
        />
        <StatCard
          title="Valor total de venta"
          value={formatUSD(stats.totalSaleValue)}
          subtitle="Precio de venta total"
          icon={<Tag className="h-5 w-5" />}
          iconClassName="bg-blue-500/15 text-blue-400"
        />
        <StatCard
          title="Ganancia potencial"
          value={formatUSD(stats.potentialProfit)}
          subtitle="Podrías ganar"
          icon={<TrendingUp className="h-5 w-5" />}
          iconClassName="bg-violet-500/15 text-violet-400"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr_0.95fr]">
        <RecentProductsCard products={recentProducts} />
        <RecentSalesCard sales={sales} />
        <ListGenerator products={listProducts} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
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
    </div>
  );
}
