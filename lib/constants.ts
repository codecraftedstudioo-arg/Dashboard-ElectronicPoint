export const PHYSICAL_CONDITION_LABELS = {
  IMPECABLE: "Impecable",
  EXCELENTE: "Excelente",
  MUY_BUENO: "Muy bueno",
  BUENO: "Bueno",
  CON_DETALLES: "Con detalles",
} as const;

export const SALE_CHANNEL_LABELS = {
  INSTAGRAM: "Instagram",
  CLIENTE: "Cliente",
  FACEBOOK_MARKETPLACE: "Marketplace",
  REFERIDO: "Referido",
  OTRO: "Otro",
} as const;

export const CHANNEL_CHART_ORDER = [
  "INSTAGRAM",
  "CLIENTE",
  "FACEBOOK_MARKETPLACE",
  "REFERIDO",
  "OTRO",
] as const satisfies ReadonlyArray<keyof typeof SALE_CHANNEL_LABELS>;

export const PRODUCT_TYPE_LABELS = {
  IPHONE: "iPhone",
  MACBOOK: "MacBook",
} as const;

export const STORAGE_OPTIONS = ["64 GB", "128 GB", "256 GB", "512 GB", "1 TB", "2 TB"] as const;

export const CHANNEL_COLORS: Record<keyof typeof SALE_CHANNEL_LABELS, string> = {
  INSTAGRAM: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  CLIENTE: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  FACEBOOK_MARKETPLACE: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  REFERIDO: "bg-violet-500/15 text-violet-400 border-violet-500/30",
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
  | "macbook"
  | "model";
