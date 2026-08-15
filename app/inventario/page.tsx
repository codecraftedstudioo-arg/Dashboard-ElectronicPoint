import { PageHeader } from "@/components/ui";
import { InventoryGrid } from "@/components/inventory/inventory-grid";
import { getAllProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function InventarioPage() {
  const products = await getAllProducts({ status: "AVAILABLE" });

  return (
    <div>
      <PageHeader
        title="Inventario"
        subtitle="Todos los equipos disponibles"
      />
      <InventoryGrid products={products} />
    </div>
  );
}
