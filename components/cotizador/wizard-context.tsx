"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { TradeOption } from "@/lib/cotizador/types";
import type {
  BackCondition,
  FrameCondition,
  FunctionalityIssues,
  OriginalParts,
  PublicTradeTarget,
  QuoteAnswers,
  ScreenCondition,
  StorageCapacity,
} from "@/lib/cotizador/types";

export type ModelOption = { model: string; storages: string[] };

export type ServerQuote = {
  demo: boolean;
  finalPrice: number;
  target: PublicTradeTarget | null;
  difference: number | null;
  deductions: { label: string; amount: number }[];
};

type WizardState = {
  currentStep: number;
  canjeMode: boolean;
  model: string | null;
  storage: StorageCapacity | null;
  screenCondition: ScreenCondition | null;
  backCondition: BackCondition | null;
  frameCondition: FrameCondition | null;
  hasLiquidDamage: boolean | null;
  batteryHealth: "good" | "low" | null;
  originalParts: { screen: boolean | null; battery: boolean | null };
  hasOriginalBox: boolean | null;
  functionalityIssues: FunctionalityIssues;
  upgradeSlug: string | null;
};

const initialState: WizardState = {
  currentStep: 1,
  canjeMode: false,
  model: null,
  storage: null,
  screenCondition: null,
  backCondition: null,
  frameCondition: null,
  hasLiquidDamage: null,
  batteryHealth: null,
  originalParts: { screen: null, battery: null },
  hasOriginalBox: null,
  functionalityIssues: { faceId: false, camera: false, audio: false, charging: false },
  upgradeSlug: null,
};

type WizardContextValue = {
  state: WizardState;
  models: ModelOption[];
  tradeOptions: TradeOption[];
  initialSlug?: string;
  quote: ServerQuote | null;
  demoPricing: boolean;
  pending: boolean;
  error: string | null;
  setModel: (model: string) => void;
  setStorage: (storage: StorageCapacity) => void;
  setScreenCondition: (condition: ScreenCondition) => void;
  setBackCondition: (condition: BackCondition) => void;
  setFrameCondition: (condition: FrameCondition) => void;
  setLiquidDamage: (hasDamage: boolean) => void;
  setBatteryHealth: (health: "good" | "low") => void;
  setOriginalParts: (parts: Partial<OriginalParts>) => void;
  setOriginalBox: (hasBox: boolean) => void;
  setFunctionality: (issues: Partial<FunctionalityIssues>) => void;
  setCanjeMode: (value: boolean) => void;
  setUpgradeSlug: (slug: string | null) => void;
  clearUpgrade: () => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
  submitQuote: () => Promise<void>;
  chooseUpgrade: (slug: string) => Promise<void>;
};

const WizardContext = createContext<WizardContextValue | null>(null);

export function WizardProvider({
  children,
  models,
  tradeOptions,
  initialSlug,
  demoPricing = true,
}: {
  children: ReactNode;
  models: ModelOption[];
  tradeOptions: TradeOption[];
  initialSlug?: string;
  demoPricing?: boolean;
}) {
  const [state, setState] = useState<WizardState>(initialState);
  const [quote, setQuote] = useState<ServerQuote | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const value: WizardContextValue = {
    state,
    models,
    tradeOptions,
    initialSlug,
    quote,
    demoPricing,
    pending,
    error,
    setModel: (model) => setState((current) => ({ ...current, model, storage: null })),
    setStorage: (storage) => setState((current) => ({ ...current, storage })),
    setScreenCondition: (screenCondition) =>
      setState((current) => ({ ...current, screenCondition })),
    setBackCondition: (backCondition) => setState((current) => ({ ...current, backCondition })),
    setFrameCondition: (frameCondition) =>
      setState((current) => ({ ...current, frameCondition })),
    setLiquidDamage: (hasLiquidDamage) =>
      setState((current) => ({ ...current, hasLiquidDamage })),
    setBatteryHealth: (batteryHealth) => setState((current) => ({ ...current, batteryHealth })),
    setOriginalParts: (parts) =>
      setState((current) => ({
        ...current,
        originalParts: { ...current.originalParts, ...parts },
      })),
    setOriginalBox: (hasOriginalBox) => setState((current) => ({ ...current, hasOriginalBox })),
    setFunctionality: (issues) =>
      setState((current) => ({
        ...current,
        functionalityIssues: { ...current.functionalityIssues, ...issues },
      })),
    setCanjeMode: (canjeMode) => setState((current) => ({ ...current, canjeMode })),
    setUpgradeSlug: (upgradeSlug) => setState((current) => ({ ...current, upgradeSlug })),
    clearUpgrade: () => setState((current) => ({ ...current, upgradeSlug: null })),
    nextStep: () =>
      setState((current) => ({ ...current, currentStep: Math.min(current.currentStep + 1, 5) })),
    prevStep: () =>
      setState((current) => ({ ...current, currentStep: Math.max(current.currentStep - 1, 1) })),
    reset: () => {
      setState(initialState);
      setQuote(null);
      setError(null);
      setPending(false);
    },
    submitQuote: () =>
      requestQuote(state, state.canjeMode ? state.upgradeSlug : null, setPending, setError, setQuote, setState),
    chooseUpgrade: (slug) =>
      requestQuote(state, slug, setPending, setError, setQuote, setState),
  };

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}

async function requestQuote(
  state: WizardState,
  equipoSlug: string | null,
  setPending: (value: boolean) => void,
  setError: (value: string | null) => void,
  setQuote: (value: ServerQuote) => void,
  setState: (value: WizardState | ((current: WizardState) => WizardState)) => void,
) {
  const answers = toAnswers(state);
  if (!answers) return;
  setPending(true);
  setError(null);
  try {
    const response = await fetch("/api/cotizador/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...answers,
        ...(equipoSlug ? { equipo: equipoSlug } : {}),
      }),
    });
    const data = (await response.json()) as
      | (ServerQuote & { ok: true })
      | { ok: false; message?: string };
    if (!response.ok || !data.ok) {
      setError("message" in data && data.message ? data.message : "No se pudo calcular la cotización.");
      return;
    }
    setQuote({
      demo: data.demo !== false,
      finalPrice: data.finalPrice,
      target: data.target,
      difference: data.difference,
      deductions: readDeductions(data.deductions),
    });
    setState((current) => ({
      ...current,
      currentStep: 6,
      upgradeSlug: equipoSlug ?? current.upgradeSlug,
      canjeMode: equipoSlug ? true : current.canjeMode,
    }));
  } catch {
    setError("No se pudo calcular la cotización.");
  } finally {
    setPending(false);
  }
}

function readDeductions(value: unknown): { label: string; amount: number }[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((line) => {
    if (!line || typeof line !== "object") return [];
    const label = "label" in line && typeof line.label === "string" ? line.label : "";
    const amount = "amount" in line && typeof line.amount === "number" ? line.amount : NaN;
    if (!label || !Number.isFinite(amount) || amount <= 0) return [];
    return [{ label, amount }];
  });
}

function toAnswers(state: WizardState): QuoteAnswers | null {
  if (
    !state.model ||
    !state.storage ||
    !state.screenCondition ||
    !state.backCondition ||
    !state.frameCondition ||
    state.hasLiquidDamage === null ||
    !state.batteryHealth ||
    state.originalParts.screen === null ||
    state.originalParts.battery === null ||
    state.hasOriginalBox === null
  ) {
    return null;
  }
  return {
    model: state.model,
    storage: state.storage,
    screenCondition: state.screenCondition,
    backCondition: state.backCondition,
    frameCondition: state.frameCondition,
    hasLiquidDamage: state.hasLiquidDamage,
    batteryHealth: state.batteryHealth,
    originalParts: {
      screen: state.originalParts.screen,
      battery: state.originalParts.battery,
    },
    hasOriginalBox: state.hasOriginalBox,
    functionalityIssues: state.functionalityIssues,
  };
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) throw new Error("useWizard debe usarse dentro del cotizador");
  return context;
}
