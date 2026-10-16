import { demoConfig } from "@/lib/cotizador/pricing-engine";
import type {
  FunctionalityIssues,
  QuoteAnswers,
  StorageCapacity,
} from "@/lib/cotizador/types";

const STORAGES = new Set<StorageCapacity>(["128", "256", "512", "1024"]);
const SCREENS = new Set(["perfect", "scratches", "cracked"]);
const BACKS = new Set(["perfect", "cracked"]);
const FRAMES = new Set(["perfect", "damaged"]);
const BATTERY = new Set(["good", "low"]);

const IGNORED_PRICE_KEYS = [
  "price",
  "basePrice",
  "finalPrice",
  "salePrice",
  "upgradePrice",
  "amount",
  "difference",
  "cost",
] as const;

export type ParsedQuoteInput = {
  answers: QuoteAnswers;
  equipo: string | undefined;
};

export type ParseResult =
  | { ok: true; value: ParsedQuoteInput }
  | { ok: false; message: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

export function parseQuoteInput(body: unknown): ParseResult {
  if (!isRecord(body)) {
    return { ok: false, message: "Los datos de la cotización no son válidos." };
  }

  for (const key of IGNORED_PRICE_KEYS) {
    delete body[key];
  }

  const model = body.model;
  const storage = body.storage;
  if (typeof model !== "string" || !demoConfig.prices.some((p) => p.model === model)) {
    return { ok: false, message: "Elegí un modelo de la lista." };
  }
  if (typeof storage !== "string" || !STORAGES.has(storage as StorageCapacity)) {
    return { ok: false, message: "Elegí una capacidad válida." };
  }
  if (!demoConfig.prices.some((p) => p.model === model && p.storage === storage)) {
    return { ok: false, message: "Esa capacidad no corresponde al modelo." };
  }

  if (typeof body.screenCondition !== "string" || !SCREENS.has(body.screenCondition)) {
    return { ok: false, message: "Indicá el estado de la pantalla." };
  }
  if (typeof body.backCondition !== "string" || !BACKS.has(body.backCondition)) {
    return { ok: false, message: "Indicá el estado de la tapa." };
  }
  if (typeof body.frameCondition !== "string" || !FRAMES.has(body.frameCondition)) {
    return { ok: false, message: "Indicá el estado del marco." };
  }

  const hasLiquidDamage = readBoolean(body.hasLiquidDamage);
  const hasOriginalBox = readBoolean(body.hasOriginalBox);
  if (hasLiquidDamage === null) {
    return { ok: false, message: "Indicá si el equipo tuvo daño por líquido." };
  }
  if (hasOriginalBox === null) {
    return { ok: false, message: "Indicá si tenés la caja original." };
  }
  if (typeof body.batteryHealth !== "string" || !BATTERY.has(body.batteryHealth)) {
    return { ok: false, message: "Indicá la salud de la batería." };
  }

  if (!isRecord(body.originalParts)) {
    return { ok: false, message: "Indicá si la pantalla y la batería son originales." };
  }
  const screenOriginal = readBoolean(body.originalParts.screen);
  const batteryOriginal = readBoolean(body.originalParts.battery);
  if (screenOriginal === null || batteryOriginal === null) {
    return { ok: false, message: "Indicá si la pantalla y la batería son originales." };
  }

  if (!isRecord(body.functionalityIssues)) {
    return { ok: false, message: "Indicá el funcionamiento del equipo." };
  }
  const issues: Partial<FunctionalityIssues> = {};
  for (const key of ["faceId", "camera", "audio", "charging"] as const) {
    const value = readBoolean(body.functionalityIssues[key]);
    if (value === null) {
      return { ok: false, message: "Indicá el funcionamiento del equipo." };
    }
    issues[key] = value;
  }

  let equipo: string | undefined;
  if (typeof body.equipo === "string") {
    const trimmed = body.equipo.trim();
    if (trimmed.length > 0 && trimmed.length <= 200) equipo = trimmed;
  }

  return {
    ok: true,
    value: {
      equipo,
      answers: {
        model,
        storage: storage as StorageCapacity,
        screenCondition: body.screenCondition as QuoteAnswers["screenCondition"],
        backCondition: body.backCondition as QuoteAnswers["backCondition"],
        frameCondition: body.frameCondition as QuoteAnswers["frameCondition"],
        hasLiquidDamage,
        hasOriginalBox,
        batteryHealth: body.batteryHealth as QuoteAnswers["batteryHealth"],
        originalParts: { screen: screenOriginal, battery: batteryOriginal },
        functionalityIssues: issues as FunctionalityIssues,
      },
    },
  };
}
