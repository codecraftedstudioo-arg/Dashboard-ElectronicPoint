import { PageHeader } from "@/components/ui";
import { ProductForm } from "@/components/products/product-form";

export default function AgregarPage() {
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
