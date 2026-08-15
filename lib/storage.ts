import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

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

/** Upload product images to Supabase Storage when configured, otherwise local public/uploads. */
export async function uploadProductImage(file: File): Promise<string> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || ".jpg";
  const filename = `${randomUUID()}${ext}`;
  const bucket = storageBucket();

  const supabase = getServiceClient();
  if (supabase) {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filename, bytes, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
    return data.publicUrl;
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), bytes);
  return `/uploads/${filename}`;
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
    const objectPath = decodeURIComponent(url.slice(idx + marker.length).split("?")[0]);
    if (!objectPath) return;
    await supabase.storage.from(bucket).remove([objectPath]);
  } catch {
    // Ignore storage cleanup errors
  }
}
