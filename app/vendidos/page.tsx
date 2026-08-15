import { PageHeader } from "@/components/ui";
import { SoldPageClient } from "@/components/sales/sold-page-client";
import { getDashboardStats, getSales } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function VendidosPage() {
  const [sales, stats] = await Promise.all([getSales(), getDashboardStats()]);

  return (
    <div>
      <PageHeader
        title="Vendidos"
        subtitle="Historial completo de ventas y estadísticas"
      />
      <SoldPageClient
        sales={sales}
        channelCounts={stats.channelCounts}
        channelTotal={stats.channelTotal}
      />
    </div>
  );
}
