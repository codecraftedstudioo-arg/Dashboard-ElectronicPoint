export const PHYSICAL_CONDITION_LABELS = {
  IMPECABLE: "Impecable",
  EXCELENTE: "Excelente",
  MUY_BUENO: "Muy bueno",
  BUENO: "Bueno",
  CON_DETALLES: "Con detalles",
} as const;

export const CHIP_TYPE_LABELS = {
  SIM: "SIM (Físico)",
  ESIM: "eSIM (Virtual)",
} as const;

export const BOX_OPTION_LABELS = {
  true: "Con caja",
  false: "Sin caja",
} as const;

export const SALE_CHANNEL_LABELS = {
  CLIENTE: "Cliente",
  FACEBOOK_MARKETPLACE: "Facebook Marketplace",
  INSTAGRAM: "Instagram",
  REFERIDO: "Referido",
  GREMIO: "Gremio",
  ALE_KIVI: "Ale Kivi",
  OTRO: "Otro",
} as const;

export const CHANNEL_CHART_ORDER = [
  "CLIENTE",
  "FACEBOOK_MARKETPLACE",
  "INSTAGRAM",
  "REFERIDO",
  "GREMIO",
  "ALE_KIVI",
  "OTRO",
] as const satisfies ReadonlyArray<keyof typeof SALE_CHANNEL_LABELS>;

export const PRODUCT_TYPE_LABELS = {
  IPHONE: "iPhone",
  MACBOOK: "MacBook",
  APPLE_WATCH: "Apple Watch",
  AIRPODS: "AirPods",
  IPAD: "iPad",
  OTROS: "Otros",
} as const;

/** Public/admin category for non-iPhone Apple products. */
export const VARIED_OPPORTUNITIES_LABEL = "Oportunidades varias";

export const VARIED_OPPORTUNITY_TYPES = [
  "MACBOOK",
  "APPLE_WATCH",
  "AIRPODS",
  "IPAD",
  "OTROS",
] as const satisfies ReadonlyArray<keyof typeof PRODUCT_TYPE_LABELS>;

export function isVariedOpportunityType(
  type: keyof typeof PRODUCT_TYPE_LABELS,
): boolean {
  return (VARIED_OPPORTUNITY_TYPES as ReadonlyArray<string>).includes(type);
}

/** Category shown in filters, badges and the public catalog. */
export function productCategoryLabel(
  type: keyof typeof PRODUCT_TYPE_LABELS,
): string {
  if (isVariedOpportunityType(type)) return VARIED_OPPORTUNITIES_LABEL;
  return PRODUCT_TYPE_LABELS[type];
}

/** Stored when a product type has no capacity field. */
export const NO_STORAGE_VALUE = "-";

const NO_STORAGE_TYPES = [
  "APPLE_WATCH",
  "AIRPODS",
  "OTROS",
] as const satisfies ReadonlyArray<keyof typeof PRODUCT_TYPE_LABELS>;

export function productHasStorage(
  type: keyof typeof PRODUCT_TYPE_LABELS,
): boolean {
  return !(NO_STORAGE_TYPES as ReadonlyArray<string>).includes(type);
}

/** Types that track battery health percentage. */
export function productHasBattery(
  type: keyof typeof PRODUCT_TYPE_LABELS,
): boolean {
  return type === "IPHONE" || type === "APPLE_WATCH" || type === "IPAD";
}

export const STORAGE_OPTIONS = [
  "32 GB",
  "64 GB",
  "128 GB",
  "256 GB",
  "512 GB",
  "1 TB",
  "2 TB",
] as const;

export const CHANNEL_COLORS: Record<keyof typeof SALE_CHANNEL_LABELS, string> = {
  CLIENTE: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  FACEBOOK_MARKETPLACE: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  INSTAGRAM: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  REFERIDO: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  GREMIO: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  ALE_KIVI: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  OTRO: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
};

export const CONDITION_COLORS: Record<keyof typeof PHYSICAL_CONDITION_LABELS, string> = {
  IMPECABLE: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  EXCELENTE: "bg-teal-500/15 text-teal-400 border-teal-500/30",
  MUY_BUENO: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  BUENO: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  CON_DETALLES: "bg-orange-500/15 text-orange-400 border-orange-500/30",
};

export type ListFieldKey = "modelStorage" | "color" | "battery" | "price" | "condition";

export type ListSortOption =
  | "model-asc"
  | "model-desc"
  | "price-asc"
  | "price-desc"
  | "storage"
  | "battery"
  | "newest"
  | "oldest";

export type ListSelectOption =
  | "available"
  | "all"
  | "manual"
  | "iphone"
  | "oportunidades_varias"
  | "model";
