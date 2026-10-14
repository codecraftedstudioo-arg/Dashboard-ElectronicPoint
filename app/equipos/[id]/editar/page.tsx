import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui";
import { ProductForm } from "@/components/products/product-form";
import { ReserveProductButton } from "@/components/products/reserve-product-button";
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
        actions={
          product.status === "AVAILABLE" ? (
            <ReserveProductButton
              productId={product.id}
              isReserved={product.isReserved}
            />
          ) : null
        }
      />
      <ProductForm
        mode="edit"
        initial={{
          id: product.id,
          internalCode: product.internalCode,
          type: product.type,
          name: product.name,
          storage: product.storage,
          color: product.color,
          imei: product.imei,
          batteryCondition: product.batteryCondition,
          physicalCondition: product.physicalCondition,
          chip: product.chip,
          cost: product.cost,
          salePrice: product.salePrice,
          description: product.description,
          isPublished: product.isPublished,
          isReserved: product.isReserved,
          status: product.status,
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
