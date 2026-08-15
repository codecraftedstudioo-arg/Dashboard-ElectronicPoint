"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { nextInternalCode } from "@/lib/queries";
import { deleteStoredImage, uploadProductImage } from "@/lib/storage";
import type {
  PhysicalCondition,
  ProductType,
  SaleChannel,
} from "@prisma/client";

function parseNumber(value: FormDataEntryValue | null): number {
  return Number(String(value ?? "0").replace(",", "."));
}

async function collectImages(formData: FormData) {
  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  const urls: string[] = [];
  for (const file of files) {
    urls.push(await uploadProductImage(file));
  }
  return urls;
}

export async function createProduct(formData: FormData) {
  const type = String(formData.get("type")) as ProductType;
  const name = String(formData.get("name") || "").trim();
  const storage = String(formData.get("storage") || "").trim();
  const color = String(formData.get("color") || "").trim();
  const batteryRaw = formData.get("batteryCondition");
  const batteryCondition =
    batteryRaw === null || batteryRaw === ""
      ? null
      : Number(batteryRaw);
  const physicalCondition = String(
    formData.get("physicalCondition"),
  ) as PhysicalCondition;
  const cost = parseNumber(formData.get("cost"));
  const salePrice = parseNumber(formData.get("salePrice"));
  const description = String(formData.get("description") || "").trim() || null;

  if (!name || !storage || !color) {
    throw new Error("Completá modelo, capacidad y color.");
  }

  const internalCode = await nextInternalCode();
  const imageUrls = await collectImages(formData);

  const product = await prisma.product.create({
    data: {
      internalCode,
      type,
      name,
      storage,
      color,
      batteryCondition: type === "IPHONE" ? batteryCondition : null,
      physicalCondition,
      cost,
      salePrice,
      description,
      status: "AVAILABLE",
      images: {
        create: imageUrls.map((url, index) => ({
          url,
          isPrimary: index === 0,
        })),
      },
    },
  });

  revalidatePath("/");
  revalidatePath("/inventario");
  revalidatePath("/listas");
  redirect(`/equipos/${product.id}`);
}

export async function updateProduct(productId: string, formData: FormData) {
  const type = String(formData.get("type")) as ProductType;
  const name = String(formData.get("name") || "").trim();
  const storage = String(formData.get("storage") || "").trim();
  const color = String(formData.get("color") || "").trim();
  const batteryRaw = formData.get("batteryCondition");
  const batteryCondition =
    batteryRaw === null || batteryRaw === ""
      ? null
      : Number(batteryRaw);
  const physicalCondition = String(
    formData.get("physicalCondition"),
  ) as PhysicalCondition;
  const cost = parseNumber(formData.get("cost"));
  const salePrice = parseNumber(formData.get("salePrice"));
  const description = String(formData.get("description") || "").trim() || null;

  const imageUrls = await collectImages(formData);
  const existingCount = await prisma.productImage.count({
    where: { productId },
  });

  await prisma.product.update({
    where: { id: productId },
    data: {
      type,
      name,
      storage,
      color,
      batteryCondition: type === "IPHONE" ? batteryCondition : null,
      physicalCondition,
      cost,
      salePrice,
      description,
      ...(imageUrls.length
        ? {
            images: {
              create: imageUrls.map((url, index) => ({
                url,
                isPrimary: existingCount === 0 && index === 0,
              })),
            },
          }
        : {}),
    },
  });

  revalidatePath("/");
  revalidatePath("/inventario");
  revalidatePath(`/equipos/${productId}`);
  revalidatePath("/listas");
  redirect(`/equipos/${productId}`);
}

export async function deleteProductImage(imageId: string, productId: string) {
  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!image || image.productId !== productId) {
    throw new Error("Imagen no encontrada.");
  }

  await prisma.productImage.delete({ where: { id: imageId } });
  await deleteStoredImage(image.url);

  if (image.isPrimary) {
    const next = await prisma.productImage.findFirst({
      where: { productId },
      orderBy: { createdAt: "asc" },
    });
    if (next) {
      await prisma.productImage.update({
        where: { id: next.id },
        data: { isPrimary: true },
      });
    }
  }

  revalidatePath(`/equipos/${productId}`);
  revalidatePath(`/equipos/${productId}/editar`);
  revalidatePath("/");
  revalidatePath("/inventario");
}

export async function setPrimaryProductImage(imageId: string, productId: string) {
  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!image || image.productId !== productId) {
    throw new Error("Imagen no encontrada.");
  }

  await prisma.$transaction([
    prisma.productImage.updateMany({
      where: { productId },
      data: { isPrimary: false },
    }),
    prisma.productImage.update({
      where: { id: imageId },
      data: { isPrimary: true },
    }),
  ]);

  revalidatePath(`/equipos/${productId}`);
  revalidatePath(`/equipos/${productId}/editar`);
  revalidatePath("/");
  revalidatePath("/inventario");
}

export async function markAsSold(formData: FormData) {
  const productId = String(formData.get("productId"));
  const soldPrice = parseNumber(formData.get("soldPrice"));
  const channel = String(formData.get("channel")) as SaleChannel;
  const notes = String(formData.get("notes") || "").trim() || null;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.status !== "AVAILABLE") {
    throw new Error("El equipo no está disponible para venta.");
  }

  await prisma.$transaction([
    prisma.sale.create({
      data: {
        productId,
        soldPrice,
        channel,
        notes,
        soldAt: new Date(),
      },
    }),
    prisma.product.update({
      where: { id: productId },
      data: { status: "SOLD" },
    }),
  ]);

  revalidatePath("/");
  revalidatePath("/inventario");
  revalidatePath("/vendidos");
  revalidatePath(`/equipos/${productId}`);
  redirect("/vendidos");
}
