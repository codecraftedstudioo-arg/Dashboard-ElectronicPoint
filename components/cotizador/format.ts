export function formatUsd(price: number): string {
  return `USD ${price.toLocaleString("es-AR")}`;
}

export function formatCapacity(storage: string): string {
  if (/gb/i.test(storage) || /tb/i.test(storage)) {
    return storage.replace(/gb/i, "GB").replace(/tb/i, "TB");
  }
  const num = parseInt(storage, 10);
  if (Number.isNaN(num)) return storage;
  if (num >= 1024) return `${num / 1024} TB`;
  return `${storage} GB`;
}

export function formatArs(usd: number, usdToArs: number): string {
  return `${Math.round(Math.abs(usd) * usdToArs).toLocaleString("es-AR")} ARS`;
}
