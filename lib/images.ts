export function primaryImageUrl(
  images: { url: string; isPrimary: boolean }[],
): string | null {
  if (!images.length) return null;
  return images.find((i) => i.isPrimary)?.url ?? images[0].url;
}
