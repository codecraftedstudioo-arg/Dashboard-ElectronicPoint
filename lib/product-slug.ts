export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildProductSlug(product: {
  id: string;
  name: string;
  storage: string;
}): string {
  const base = slugify(`${product.name}-${product.storage}`);
  return `${base}--${product.id}`;
}

export function parseProductIdFromSlug(slug: string): string | null {
  const parts = slug.split("--");
  if (parts.length < 2) return null;
  const id = parts[parts.length - 1]?.trim();
  return id || null;
}
