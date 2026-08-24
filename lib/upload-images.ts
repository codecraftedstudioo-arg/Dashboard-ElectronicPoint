import { uploadProductImage } from "@/lib/storage";

export type UploadableFile = Blob & {
  name: string;
  type: string;
};

export function extractImageFiles(formData: FormData): UploadableFile[] {
  const files: UploadableFile[] = [];

  for (const entry of formData.getAll("images")) {
    if (typeof entry === "string") continue;
    if (!("arrayBuffer" in entry) || !("size" in entry) || entry.size <= 0) continue;

    const file = entry as UploadableFile;
    files.push(file);
  }

  if (process.env.NODE_ENV === "development") {
    console.log("[images] Selected images:", files.length);
    files.forEach((file, index) => {
      console.log(
        `[images]  ${index + 1}. ${file.name} (${file.size} bytes, ${file.type || "unknown"})`,
      );
    });
  }

  return files;
}

export async function uploadProductImages(
  files: UploadableFile[],
  productId: string,
): Promise<string[]> {
  const urls: string[] = [];
  const errors: string[] = [];

  for (const file of files) {
    try {
      if (process.env.NODE_ENV === "development") {
        console.log("[images] Uploading image:", file.name, "→ product", productId);
      }

      const url = await uploadProductImage(file, productId);

      if (process.env.NODE_ENV === "development") {
        console.log("[images] Upload response URL:", url);
      }

      urls.push(url);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error desconocido al subir la imagen";
      errors.push(`${file.name}: ${message}`);
      if (process.env.NODE_ENV === "development") {
        console.error("[images] Upload failed:", file.name, error);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `No se pudieron subir todas las imágenes.\n${errors.join("\n")}`,
    );
  }

  return urls;
}

export function buildProductImageRecords(
  productId: string,
  urls: string[],
  primaryIndex: number,
  sortOrderStart = 0,
) {
  return urls.map((url, index) => ({
    productId,
    url,
    sortOrder: sortOrderStart + index,
    isPrimary: primaryIndex >= 0 && index === primaryIndex,
  }));
}
