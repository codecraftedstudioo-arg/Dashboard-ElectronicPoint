import demoPricing from "@/lib/cotizador/demo-pricing.json";
import type { PriceResult, QuoteAnswers } from "@/lib/cotizador/types";

export { DEMO_QUOTE_WARNING } from "@/lib/cotizador/demo-copy";

type PenaltyValue = { type: "percentage" | "fixed_usd"; value: number };

type EnginePenalty = PenaltyValue & {
  overrides: Record<string, PenaltyValue>;
};

type PricingConfig = {
  prices: { model: string; storage: string; price: number }[];
  deductions: Record<string, number>;
};

export type EngineConfig = {
  prices: { model: string; storage: string; price: number }[];
  penalties: Record<string, EnginePenalty>;
};

const STATIC_FIXED_KEYS = new Set(["noOriginalBox"]);

export const roundTo5 = (n: number) => Math.round(n / 5) * 5;

export function buildConfigFromStatic(data: PricingConfig): EngineConfig {
  const penalties: Record<string, EnginePenalty> = {};
  for (const [key, value] of Object.entries(data.deductions)) {
    penalties[key] = {
      type: STATIC_FIXED_KEYS.has(key) ? "fixed_usd" : "percentage",
      value,
      overrides: {},
    };
  }
  return { prices: data.prices, penalties };
}

export const demoConfig = buildConfigFromStatic(
  demoPricing as PricingConfig,
);

function resolvePenalty(
  config: EngineConfig,
  key: string,
  model: string,
): PenaltyValue {
  const pen = config.penalties[key];
  if (!pen) return { type: "percentage", value: 0 };
  if (pen.overrides[model]) return pen.overrides[model];
  return { type: pen.type, value: pen.value };
}

export function calculatePrice(
  state: QuoteAnswers,
  config: EngineConfig = demoConfig,
): PriceResult | null {
  const priceEntry = config.prices.find(
    (p) => p.model === state.model && p.storage === state.storage,
  );
  if (!priceEntry) return null;

  const basePrice = priceEntry.price;
  const deductionBreakdown: PriceResult["deductionBreakdown"] = [];

  const apply = (reason: string, key: string) => {
    const resolved = resolvePenalty(config, key, state.model);
    deductionBreakdown.push({
      reason,
      percentage: resolved.type === "percentage" ? resolved.value : 0,
      amount: resolved.type === "fixed_usd" ? resolved.value : 0,
    });
  };

  if (state.screenCondition === "cracked") {
    apply("deductScreenCracked", "screenCracked");
  } else if (state.screenCondition === "scratches") {
    apply("deductScreenScratches", "screenScratches");
  }

  if (state.backCondition === "cracked") {
    apply("deductBackCracked", "backCracked");
  }
  if (state.frameCondition === "damaged") {
    apply("deductFrameDamaged", "frameDamaged");
  }
  if (state.hasLiquidDamage) {
    apply("deductLiquidDamage", "liquidDamage");
  }
  if (state.batteryHealth === "low") {
    apply("deductBatteryLow", "batteryBelow85");
  }
  if (state.originalParts.battery === false) {
    apply("deductBatteryNotOriginal", "batteryNotOriginal");
  }
  if (state.originalParts.screen === false) {
    apply("deductScreenNotOriginal", "screenNotOriginal");
  }
  if (state.functionalityIssues.faceId) {
    apply("deductFaceId", "faceIdNotWorking");
  }
  if (state.functionalityIssues.camera) {
    apply("deductCamera", "cameraNotWorking");
  }
  if (state.functionalityIssues.audio) {
    apply("deductAudio", "audioNotWorking");
  }
  if (state.functionalityIssues.charging) {
    apply("deductCharging", "chargingNotWorking");
  }
  if (state.hasOriginalBox === false) {
    apply("deductNoOriginalBox", "noOriginalBox");
  }

  const totalDeductionPercentage = deductionBreakdown.reduce(
    (sum, line) => sum + line.percentage,
    0,
  );

  for (const line of deductionBreakdown) {
    if (line.percentage > 0) {
      line.amount = roundTo5(basePrice * line.percentage);
    }
  }

  const fixedDeductions = deductionBreakdown
    .filter((line) => line.percentage === 0 && line.amount > 0)
    .reduce((sum, line) => sum + line.amount, 0);

  const totalDeductionAmount =
    roundTo5(basePrice * totalDeductionPercentage) + fixedDeductions;
  const finalPrice = Math.max(0, roundTo5(basePrice - totalDeductionAmount));

  return {
    basePrice,
    totalDeductions: totalDeductionPercentage,
    finalPrice,
    deductionBreakdown,
  };
}

export function listQuoteModels(config: EngineConfig = demoConfig): {
  model: string;
  storages: string[];
}[] {
  const order: string[] = [];
  const storages = new Map<string, string[]>();
  for (const entry of config.prices) {
    const list = storages.get(entry.model);
    if (list) list.push(entry.storage);
    else {
      order.push(entry.model);
      storages.set(entry.model, [entry.storage]);
    }
  }
  return order.map((model) => ({
    model,
    storages: storages.get(model) ?? [],
  }));
}

export function formatStorage(storage: string): string {
  const num = parseInt(storage, 10);
  if (num >= 1024) return `${num / 1024} TB`;
  return `${storage} GB`;
}

export const DEDUCTION_LABELS: Record<string, string> = {
  deductScreenCracked: "Pantalla rajada/rota",
  deductScreenScratches: "Pantalla con rayones",
  deductBackCracked: "Tapa trasera rota",
  deductFrameDamaged: "Marco/chasis dañado",
  deductLiquidDamage: "Daño por líquido",
  deductBatteryLow: "Batería menor a 85%",
  deductBatteryNotOriginal: "Batería no original",
  deductScreenNotOriginal: "Pantalla no original",
  deductFaceId: "Face ID no funciona",
  deductCamera: "Problemas de cámara",
  deductAudio: "Problemas de audio",
  deductCharging: "Problemas de carga",
  deductNoOriginalBox: "Sin caja original",
};
