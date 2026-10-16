import { PageHeader } from "@/components/ui";
import { ProductForm } from "@/components/products/product-form";
import { requireDashboardPage } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AgregarPage() {
  await requireDashboardPage();
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Agregar equipo"
        subtitle="Cargá un iPhone o MacBook al stock"
      />
      <ProductForm />
    </div>
  );
}
