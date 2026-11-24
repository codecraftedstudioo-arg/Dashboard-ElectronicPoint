import { PageHeader } from "@/components/ui";
import { CurrencySelector } from "@/components/layout/app-shell";
import { SoldPageClient } from "@/components/sales/sold-page-client";
import { getSales, getSellerCommissions } from "@/lib/queries";
import { requireDashboardPage } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function VendidosPage() {
  await requireDashboardPage();
  const [sales, commissions] = await Promise.all([
    getSales(),
    getSellerCommissions(),
  ]);

  return (
    <div>
      <PageHeader
        title="Vendidos"
        subtitle="Historial de ventas y estadísticas"
        actions={<CurrencySelector />}
      />
      <SoldPageClient sales={sales} commissions={commissions} />
    </div>
  );
}
