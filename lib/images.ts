export type ProductImageLike = {
  id?: string;
  url: string;
  isPrimary: boolean;
  sortOrder?: number;
  createdAt?: Date;
};

export function sortProductImages<T extends ProductImageLike>(images: T[]): T[] {
  return [...images].sort((a, b) => {
    const orderDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
    if (orderDiff !== 0) return orderDiff;
    if (a.createdAt && b.createdAt) {
      return a.createdAt.getTime() - b.createdAt.getTime();
    }
    return 0;
  });
}

export function primaryImageUrl(images: ProductImageLike[]): string | null {
  if (!images.length) return null;
  const sorted = sortProductImages(images);
  return sorted.find((i) => i.isPrimary)?.url ?? sorted[0].url;
}
