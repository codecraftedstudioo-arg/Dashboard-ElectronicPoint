import { calculatePrice, demoConfig } from "@/lib/cotizador/pricing-engine";
import type { EngineConfig } from "@/lib/cotizador/pricing-engine";
import type { PriceResult } from "@/lib/cotizador/types";
import { parseQuoteInput } from "@/lib/cotizador/validate";

export type PenaltyKind = "PERCENTAGE" | "FIXED_USD";

export const PENALTY_SPECS = [
  { key: "screenCracked", kind: "PERCENTAGE", label: "Pantalla rajada/rota" },
  { key: "screenScratches", kind: "PERCENTAGE", label: "Pantalla con rayones" },
  { key: "backCracked", kind: "PERCENTAGE", label: "Tapa trasera rota" },
  { key: "frameDamaged", kind: "PERCENTAGE", label: "Marco/chasis dañado" },
  { key: "liquidDamage", kind: "PERCENTAGE", label: "Daño por líquido" },
  { key: "batteryBelow85", kind: "PERCENTAGE", label: "Batería menor a 85%" },
  { key: "batteryNotOriginal", kind: "PERCENTAGE", label: "Batería no original" },
  { key: "screenNotOriginal", kind: "PERCENTAGE", label: "Pantalla no original" },
  { key: "faceIdNotWorking", kind: "PERCENTAGE", label: "Face ID no funciona" },
  { key: "cameraNotWorking", kind: "PERCENTAGE", label: "Problemas de cámara" },
  { key: "audioNotWorking", kind: "PERCENTAGE", label: "Problemas de audio" },
  { key: "chargingNotWorking", kind: "PERCENTAGE", label: "Problemas de carga" },
  { key: "noOriginalBox", kind: "FIXED_USD", label: "Sin caja original" },
] as const satisfies ReadonlyArray<{
  key: string;
  kind: PenaltyKind;
  label: string;
}>;

export type DraftPrice = {
  model: string;
  storage: string;
  priceUsd: number;
};

export type DraftPenalty = {
  key: string;
  kind: PenaltyKind;
  value: number;
};

export type QuoteDraftInput = {
  note: string | null;
  prices: DraftPrice[];
  penalties: DraftPenalty[];
};

const MAX_PRICE_USD = 100_000;
const MAX_NOTE = 280;

export function demoQuoteDraft(): QuoteDraftInput {
  return {
    note: null,
    prices: demoConfig.prices.map((price) => ({
      model: price.model,
      storage: price.storage,
      priceUsd: price.price,
    })),
    penalties: PENALTY_SPECS.map((spec) => ({
      key: spec.key,
      kind: spec.kind,
      value: demoConfig.penalties[spec.key]?.value ?? 0,
    })),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readMoney(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Math.round(value * 10000) / 10000;
}

export function parseDraftInput(
  input: unknown,
): { ok: true; value: QuoteDraftInput } | { ok: false; message: string } {
  if (!isRecord(input)) {
    return { ok: false, message: "El borrador no tiene un formato válido." };
  }

  let note: string | null = null;
  if (input.note !== undefined && input.note !== null) {
    if (typeof input.note !== "string") {
      return { ok: false, message: "La nota del borrador no es válida." };
    }
    note = input.note.trim();
    if (note.length > MAX_NOTE) {
      return { ok: false, message: "La nota del borrador es demasiado larga." };
    }
    if (note.length === 0) note = null;
  }

  if (!Array.isArray(input.prices) || !Array.isArray(input.penalties)) {
    return { ok: false, message: "Faltan precios o penalizaciones." };
  }

  const expected = demoQuoteDraft();
  const pricesByKey = new Map<string, DraftPrice>();
  for (const row of input.prices) {
    if (!isRecord(row) || typeof row.model !== "string" || typeof row.storage !== "string") {
      return { ok: false, message: "Hay un precio con modelo o capacidad inválidos." };
    }
    const priceUsd = readMoney(row.priceUsd);
    if (priceUsd === null || !Number.isInteger(priceUsd) || priceUsd < 0 || priceUsd > MAX_PRICE_USD) {
      return { ok: false, message: `El precio de ${row.model} ${row.storage} tiene que ser un entero en USD.` };
    }
    const key = `${row.model}\0${row.storage}`;
    if (pricesByKey.has(key)) {
      return { ok: false, message: "Hay un modelo y capacidad repetidos." };
    }
    pricesByKey.set(key, { model: row.model, storage: row.storage, priceUsd });
  }

  if (pricesByKey.size !== expected.prices.length) {
    return { ok: false, message: "El borrador tiene que incluir exactamente los modelos y capacidades de la demostración." };
  }

  const prices: DraftPrice[] = [];
  for (const row of expected.prices) {
    const found = pricesByKey.get(`${row.model}\0${row.storage}`);
    if (!found) {
      return { ok: false, message: `Falta el precio de ${row.model} ${row.storage}.` };
    }
    prices.push(found);
  }

  const specs = new Map<string, (typeof PENALTY_SPECS)[number]>(
    PENALTY_SPECS.map((spec) => [spec.key, spec]),
  );
  const penaltiesByKey = new Map<string, DraftPenalty>();
  for (const row of input.penalties) {
    if (!isRecord(row) || typeof row.key !== "string") {
      return { ok: false, message: "Hay una penalización inválida." };
    }
    const spec = specs.get(row.key);
    if (!spec) {
      return { ok: false, message: "Hay una penalización que el motor no usa." };
    }
    if (row.kind !== "PERCENTAGE" && row.kind !== "FIXED_USD") {
      return {
        ok: false,
        message: `La penalización ${spec.label} tiene que ser porcentual o un monto fijo en USD.`,
      };
    }
    const kind = row.kind as PenaltyKind;
    const value = readMoney(row.value);
    if (value === null || value < 0) {
      return { ok: false, message: `El valor de ${spec.label} no es válido.` };
    }
    if (kind === "PERCENTAGE" && value > 1) {
      return { ok: false, message: `${spec.label} no puede superar el 100 %.` };
    }
    if (kind === "FIXED_USD" && value > MAX_PRICE_USD) {
      return { ok: false, message: `${spec.label} supera el máximo permitido.` };
    }
    if (penaltiesByKey.has(row.key)) {
      return { ok: false, message: "Hay una penalización repetida." };
    }
    penaltiesByKey.set(row.key, { key: row.key, kind, value });
  }

  if (penaltiesByKey.size !== PENALTY_SPECS.length) {
    return { ok: false, message: "Falta alguna penalización del motor." };
  }

  return {
    ok: true,
    value: {
      note,
      prices,
      penalties: PENALTY_SPECS.map((spec) => penaltiesByKey.get(spec.key)!),
    },
  };
}

export function toEngineConfig(draft: QuoteDraftInput): EngineConfig {
  const penalties: EngineConfig["penalties"] = {};
  for (const penalty of draft.penalties) {
    penalties[penalty.key] = {
      type: penalty.kind === "FIXED_USD" ? "fixed_usd" : "percentage",
      value: penalty.value,
      overrides: {},
    };
  }
  return {
    prices: draft.prices.map((price) => ({
      model: price.model,
      storage: price.storage,
      price: price.priceUsd,
    })),
    penalties,
  };
}

export function previewDraftCalculation(
  draftInput: unknown,
  answersInput: unknown,
): { ok: true; price: PriceResult } | { ok: false; message: string } {
  const draft = parseDraftInput(draftInput);
  if (!draft.ok) return draft;
  const parsed = parseQuoteInput(
    typeof answersInput === "object" && answersInput !== null
      ? structuredClone(answersInput)
      : answersInput,
  );
  if (!parsed.ok) return parsed;
  const price = calculatePrice(parsed.value.answers, toEngineConfig(draft.value));
  if (!price) {
    return { ok: false, message: "No hay un precio para ese modelo y capacidad en este borrador." };
  }
  return { ok: true, price };
}
