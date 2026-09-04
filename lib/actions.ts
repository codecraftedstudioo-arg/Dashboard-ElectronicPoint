"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { nextInternalCode } from "@/lib/queries";
import { deleteStoredImage, uploadProductImage } from "@/lib/storage";
import type {
  ChipType,
  PhysicalCondition,
  ProductType,
  SaleChannel,
} from "@prisma/client";

function parseNumber(value: FormDataEntryValue | null): number {
  return Number(String(value ?? "0").replace(",", "."));
}

function isUploadableFile(value: FormDataEntryValue | null): value is File {
  if (!value || typeof value === "string") return false;
  if (value instanceof File) return value.size > 0;
  return (
    typeof value === "object" &&
    "arrayBuffer" in value &&
    "size" in value &&
    (value as File).size > 0
  );
}

function collectPreUploadedUrls(formData: FormData): string[] {
  return formData
    .getAll("uploadedImageUrls")
    .map((value) => String(value).trim())
    .filter((url) => url.startsWith("http") || url.startsWith("/uploads/"));
}

async function collectImages(formData: FormData) {
  const preUploaded = collectPreUploadedUrls(formData);
  if (preUploaded.length > 0) {
    if (process.env.NODE_ENV === "development") {
      console.log("[images] Using pre-uploaded URLs:", preUploaded.length);
    }
    return preUploaded;
  }

  const files = formData.getAll("images").filter(isUploadableFile);

  if (process.env.NODE_ENV === "development") {
    console.log("[images] Selected images:", files.length);
    files.forEach((file, index) => {
      console.log(
        `[images]  ${index + 1}. ${file.name} (${file.size} bytes)`,
      );
    });
  }

  const urls: string[] = [];
  for (const file of files) {
    if (process.env.NODE_ENV === "development") {
      console.log("[images] Uploading image:", file.name);
    }
    const url = await uploadProductImage(file);
    if (process.env.NODE_ENV === "development") {
      console.log("[images] Uploaded image URL:", url);
    }
    urls.push(url);
  }
  return urls;
}

/** Upload one image at a time to avoid Vercel/Next body size limits with multi-photo forms. */
export async function uploadSingleProductImage(formData: FormData): Promise<string> {
  const file = formData.get("image");
  if (!isUploadableFile(file)) {
    throw new Error("No se recibió ninguna imagen válida.");
  }

  if (process.env.NODE_ENV === "development") {
    console.log("[images] Uploading single image:", file.name, file.size);
  }

  const url = await uploadProductImage(file);

  if (process.env.NODE_ENV === "development") {
    console.log("[images] Uploaded image URL:", url);
  }

  return url;
}

function parseImei(value: FormDataEntryValue | null): string | null {
  const imei = String(value ?? "").trim();
  return imei || null;
}

function parseChip(value: FormDataEntryValue | null): ChipType | null {
  const chip = String(value ?? "").trim();
  if (chip === "SIM" || chip === "ESIM") return chip;
  return null;
}

function parsePrimaryIndex(formData: FormData): number {
  const raw = Number(formData.get("primaryImageIndex"));
  return Number.isFinite(raw) && raw >= 0 ? Math.floor(raw) : 0;
}

export async function createProduct(formData: FormData) {
  const type = String(formData.get("type")) as ProductType;
  const name = String(formData.get("name") || "").trim();
  const storage = String(formData.get("storage") || "").trim();
  const color = String(formData.get("color") || "").trim();
  const imei = parseImei(formData.get("imei"));
  const batteryRaw = formData.get("batteryCondition");
  const batteryCondition =
    batteryRaw === null || batteryRaw === "" ? null : Number(batteryRaw);
  const physicalCondition = String(
    formData.get("physicalCondition"),
  ) as PhysicalCondition;
  const chip = parseChip(formData.get("chip"));
  const cost = parseNumber(formData.get("cost"));
  const salePrice = parseNumber(formData.get("salePrice"));
  const description = String(formData.get("description") || "").trim() || null;
  const isPublished = formData.get("isPublished") === "true";

  if (!name || !storage || !color) {
    throw new Error("Completá modelo, capacidad y color.");
  }

  const internalCode = await nextInternalCode();
  const imageUrls = await collectImages(formData);
  const primaryIndex = parsePrimaryIndex(formData);

  const product = await prisma.product.create({
    data: {
      internalCode,
      type,
      name,
      storage,
      color,
      imei,
      batteryCondition: type === "IPHONE" ? batteryCondition : null,
      physicalCondition,
      chip: type === "IPHONE" ? chip : null,
      cost,
      salePrice,
      description,
      isPublished,
      status: "AVAILABLE",
      images: {
        create: imageUrls.map((url, index) => ({
          url,
          sortOrder: index,
          isPrimary: index === primaryIndex,
        })),
      },
    },
  });

  if (process.env.NODE_ENV === "development") {
    console.log("[images] Product ID:", product.id);
    console.log("[images] Creating ProductImage records:", imageUrls.length);
  }

  revalidatePath("/");
  revalidatePath("/inventario");
  revalidatePath("/listas");
  revalidatePath("/usados");
  redirect(`/equipos/${product.id}`);
}

export async function updateProduct(productId: string, formData: FormData) {
  const type = String(formData.get("type")) as ProductType;
  const name = String(formData.get("name") || "").trim();
  const storage = String(formData.get("storage") || "").trim();
  const color = String(formData.get("color") || "").trim();
  const imei = parseImei(formData.get("imei"));
  const batteryRaw = formData.get("batteryCondition");
  const batteryCondition =
    batteryRaw === null || batteryRaw === "" ? null : Number(batteryRaw);
  const physicalCondition = String(
    formData.get("physicalCondition"),
  ) as PhysicalCondition;
  const chip = parseChip(formData.get("chip"));
  const cost = parseNumber(formData.get("cost"));
  const salePrice = parseNumber(formData.get("salePrice"));
  const description = String(formData.get("description") || "").trim() || null;
  const isPublished = formData.get("isPublished") === "true";

  const imageUrls = await collectImages(formData);
  const primaryIndex = parsePrimaryIndex(formData);
  const newPrimaryAmongNewRaw = formData.get("newPrimaryAmongNew");
  const newPrimaryAmongNew =
    newPrimaryAmongNewRaw === null || newPrimaryAmongNewRaw === ""
      ? null
      : Number(newPrimaryAmongNewRaw);
  const existingCount = await prisma.productImage.count({
    where: { productId },
  });
  const maxOrder = await prisma.productImage.aggregate({
    where: { productId },
    _max: { sortOrder: true },
  });
  const startOrder = (maxOrder._max.sortOrder ?? -1) + 1;

  await prisma.product.update({
    where: { id: productId },
    data: {
      type,
      name,
      storage,
      color,
      imei,
      batteryCondition: type === "IPHONE" ? batteryCondition : null,
      physicalCondition,
      chip: type === "IPHONE" ? chip : null,
      cost,
      salePrice,
      description,
      isPublished,
      ...(imageUrls.length
        ? {
            images: {
              create: imageUrls.map((url, index) => ({
                url,
                sortOrder: startOrder + index,
                isPrimary:
                  existingCount === 0
                    ? index === primaryIndex
                    : newPrimaryAmongNew === index,
              })),
            },
          }
        : {}),
    },
  });

  if (
    imageUrls.length > 0 &&
    newPrimaryAmongNew !== null &&
    Number.isFinite(newPrimaryAmongNew) &&
    newPrimaryAmongNew >= 0 &&
    newPrimaryAmongNew < imageUrls.length
  ) {
    const created = await prisma.productImage.findMany({
      where: { productId, url: { in: imageUrls } },
      orderBy: { sortOrder: "asc" },
    });
    const target = created[newPrimaryAmongNew];
    if (target) {
      await prisma.$transaction([
        prisma.productImage.updateMany({
          where: { productId },
          data: { isPrimary: false },
        }),
        prisma.productImage.update({
          where: { id: target.id },
          data: { isPrimary: true },
        }),
      ]);
    }
  }

  revalidatePath("/");
  revalidatePath("/inventario");
  revalidatePath(`/equipos/${productId}`);
  revalidatePath(`/equipos/${productId}/editar`);
  revalidatePath("/listas");
  revalidatePath("/usados");
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
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
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
  revalidatePath("/usados");
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
  revalidatePath("/usados");
}

export async function reorderProductImages(productId: string, imageIds: string[]) {
  const images = await prisma.productImage.findMany({
    where: { productId },
    select: { id: true },
  });
  const validIds = new Set(images.map((img) => img.id));
  if (
    imageIds.length !== images.length ||
    imageIds.some((id) => !validIds.has(id))
  ) {
    throw new Error("Orden de imágenes inválido.");
  }

  await prisma.$transaction(
    imageIds.map((id, index) =>
      prisma.productImage.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );

  revalidatePath(`/equipos/${productId}`);
  revalidatePath(`/equipos/${productId}/editar`);
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
  revalidatePath("/usados");
  redirect("/vendidos");
}

function parseSaleChannel(
  value: FormDataEntryValue | null,
): SaleChannel | null {
  const channel = String(value ?? "").trim();
  if (
    channel === "CLIENTE" ||
    channel === "FACEBOOK_MARKETPLACE" ||
    channel === "INSTAGRAM" ||
    channel === "REFERIDO" ||
    channel === "GREMIO" ||
    channel === "OTRO"
  ) {
    return channel;
  }
  return null;
}

export async function updateSalePrice(formData: FormData) {
  const saleId = String(formData.get("saleId"));
  const soldPrice = parseNumber(formData.get("soldPrice"));
  const channel = parseSaleChannel(formData.get("channel"));

  if (!saleId) {
    throw new Error("Venta no encontrada.");
  }
  if (!Number.isFinite(soldPrice) || soldPrice < 0) {
    throw new Error("Precio de venta inválido.");
  }
  if (!channel) {
    throw new Error("Canal de venta inválido.");
  }

  const sale = await prisma.sale.findUnique({
    where: { id: saleId },
    select: { productId: true },
  });
  if (!sale) {
    throw new Error("Venta no encontrada.");
  }

  await prisma.sale.update({
    where: { id: saleId },
    data: { soldPrice, channel },
  });

  revalidatePath("/");
  revalidatePath("/vendidos");
  revalidatePath(`/equipos/${sale.productId}`);
}

export type RepublishSoldProductResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function republishSoldProduct(
  saleId: string,
): Promise<RepublishSoldProductResult> {
  const errorMessage =
    "No se pudo volver a publicar el equipo. No se realizaron cambios.";

  if (!saleId) {
    return { ok: false, message: errorMessage };
  }

  let productId: string | null = null;

  try {
    productId = await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id: saleId },
        include: {
          product: {
            select: { id: true, status: true },
          },
        },
      });

      if (!sale) {
        throw new Error("SALE_NOT_FOUND");
      }
      if (sale.product.status !== "SOLD") {
        throw new Error("PRODUCT_NOT_SOLD");
      }

      await tx.sale.delete({ where: { id: saleId } });
      await tx.product.update({
        where: { id: sale.productId },
        data: {
          status: "AVAILABLE",
          isPublished: true,
        },
      });

      return sale.productId;
    });

    revalidatePath("/");
    revalidatePath("/inventario");
    revalidatePath("/vendidos");
    revalidatePath("/listas");
    revalidatePath("/usados");
    revalidatePath(`/equipos/${productId}`);
    revalidatePath(`/equipos/${productId}/editar`);

    return {
      ok: true,
      message: "Equipo vuelto a publicar correctamente.",
    };
  } catch {
    return { ok: false, message: errorMessage };
  }
}

export type DeleteProductResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function deleteProduct(
  productId: string,
): Promise<DeleteProductResult> {
  const genericError = "No se pudo eliminar el equipo. Intentá nuevamente.";
  const soldError =
    "No se puede eliminar este equipo porque tiene una venta asociada. Si la venta fue cargada por error, utilizá 'Editar venta' → 'Volver a publicar equipo'.";

  if (!productId) {
    return { ok: false, message: genericError };
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        sale: { select: { id: true } },
        images: { select: { url: true } },
      },
    });

    if (!product) {
      return { ok: false, message: genericError };
    }

    if (product.sale) {
      return { ok: false, message: soldError };
    }

    const imageUrls = product.images.map((img) => img.url);

    await prisma.$transaction(async (tx) => {
      const current = await tx.product.findUnique({
        where: { id: productId },
        include: { sale: { select: { id: true } } },
      });

      if (!current) {
        throw new Error("PRODUCT_NOT_FOUND");
      }
      if (current.sale) {
        throw new Error("PRODUCT_HAS_SALE");
      }

      await tx.product.delete({ where: { id: productId } });
    });

    await Promise.all(imageUrls.map((url) => deleteStoredImage(url)));

    revalidatePath("/");
    revalidatePath("/inventario");
    revalidatePath("/vendidos");
    revalidatePath("/listas");
    revalidatePath("/usados");
    revalidatePath(`/equipos/${productId}`);
    revalidatePath(`/equipos/${productId}/editar`);

    return { ok: true, message: "Equipo eliminado correctamente." };
  } catch (error) {
    if (error instanceof Error && error.message === "PRODUCT_HAS_SALE") {
      return { ok: false, message: soldError };
    }
    console.error("[deleteProduct]", productId, error);
    return { ok: false, message: genericError };
  }
}
