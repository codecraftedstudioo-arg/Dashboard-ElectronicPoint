export type StorageCapacity = "128" | "256" | "512" | "1024";

export type ScreenCondition = "perfect" | "scratches" | "cracked";
export type BackCondition = "perfect" | "cracked";
export type FrameCondition = "perfect" | "damaged";

export type FunctionalityIssues = {
  faceId: boolean;
  camera: boolean;
  audio: boolean;
  charging: boolean;
};

export type OriginalParts = {
  screen: boolean;
  battery: boolean;
};

/** Answers that affect the quote. Contact details are not part of this state. */
export type QuoteAnswers = {
  model: string;
  storage: StorageCapacity;
  screenCondition: ScreenCondition;
  backCondition: BackCondition;
  frameCondition: FrameCondition;
  hasLiquidDamage: boolean;
  batteryHealth: "good" | "low";
  originalParts: OriginalParts;
  hasOriginalBox: boolean;
  functionalityIssues: FunctionalityIssues;
};

export type DeductionLine = {
  reason: string;
  percentage: number;
  amount: number;
};

export type PriceResult = {
  basePrice: number;
  totalDeductions: number;
  finalPrice: number;
  deductionBreakdown: DeductionLine[];
};

export type PublicTradeTarget = {
  name: string;
  storage: string;
  color: string;
  salePrice: number;
  batteryCondition: number | null;
};

export type TradeOption = PublicTradeTarget & {
  slug: string;
  imageUrl: string | null;
};
