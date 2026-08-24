import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import type { UploadableFile } from "@/lib/upload-images";

function hasSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

function getServiceClient(): SupabaseClient | null {
  if (!hasSupabaseConfig()) return null;
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

function storageBucket() {
  return process.env.SUPABASE_STORAGE_BUCKET || "product-images";
}

function buildObjectPath(productId: string | undefined, originalName: string) {
  const ext = path.extname(originalName) || ".jpg";
  const filename = `${randomUUID()}${ext}`;
  return productId ? `products/${productId}/${filename}` : filename;
}

/** Upload product images to Supabase Storage when configured, otherwise local public/uploads. */
export async function uploadProductImage(
  file: UploadableFile,
  productId?: string,
): Promise<string> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const objectPath = buildObjectPath(productId, file.name);
  const bucket = storageBucket();

  const supabase = getServiceClient();
  if (supabase) {
    if (process.env.NODE_ENV === "development") {
      console.log("[storage] Uploading to bucket:", bucket, "path:", objectPath);
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(objectPath, bytes, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });

    if (error) {
      throw new Error(
        `Supabase Storage (${bucket}): ${error.message}`,
      );
    }

    if (process.env.NODE_ENV === "development") {
      console.log("[storage] Upload response:", data);
    }

    const { data: publicData } = supabase.storage
      .from(bucket)
      .getPublicUrl(objectPath);

    if (!publicData.publicUrl) {
      throw new Error("Supabase Storage no devolvió una URL pública.");
    }

    return publicData.publicUrl;
  }

  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    throw new Error(
      "Supabase Storage no está configurado. Definí NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  const localName = path.basename(objectPath);
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, localName), bytes);
  return `/uploads/${localName}`;
}

/** Best-effort delete of a stored image file (local or Supabase). */
export async function deleteStoredImage(url: string): Promise<void> {
  if (url.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), "public", url);
    try {
      await unlink(filePath);
    } catch {
      // File may already be gone
    }
    return;
  }

  const supabase = getServiceClient();
  if (!supabase) return;

  try {
    const bucket = storageBucket();
    const marker = `/${bucket}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return;
    const objectPath = decodeURIComponent(
      url.slice(idx + marker.length).split("?")[0],
    );
    if (!objectPath) return;
    await supabase.storage.from(bucket).remove([objectPath]);
  } catch {
    // Ignore storage cleanup errors
  }
}
