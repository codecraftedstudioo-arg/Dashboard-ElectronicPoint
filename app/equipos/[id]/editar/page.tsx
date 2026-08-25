import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { ProductForm } from "@/components/products/product-form";
import { getProductById } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Editar equipo"
        subtitle={product.internalCode}
      />
      <ProductForm
        mode="edit"
        initial={{
          id: product.id,
          type: product.type,
          name: product.name,
          storage: product.storage,
          color: product.color,
          imei: product.imei,
          batteryCondition: product.batteryCondition,
          physicalCondition: product.physicalCondition,
          cost: product.cost,
          salePrice: product.salePrice,
          description: product.description,
          isPublished: product.isPublished,
          images: product.images.map((img) => ({
            id: img.id,
            url: img.url,
            isPrimary: img.isPrimary,
            sortOrder: img.sortOrder,
          })),
        }}
      />
    </div>
  );
}
