import { PageHeader } from "@/components/ui";
import { ListGenerator } from "@/components/lists/list-generator";
import { getAvailableProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ListasPage() {
  const available = await getAvailableProducts();
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
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Listas"
        subtitle="Generá listados listos para WhatsApp, Instagram o Telegram"
      />
      <ListGenerator products={listProducts} />
    </div>
  );
}
