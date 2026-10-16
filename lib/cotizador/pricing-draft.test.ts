import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { calculatePrice } from "@/lib/cotizador/pricing-engine";
import { isMissingQuoteTable } from "@/lib/cotizador/pricing-admin";
import {
  demoQuoteDraft,
  parseDraftInput,
  previewDraftCalculation,
  toEngineConfig,
} from "@/lib/cotizador/pricing-draft";
import type { QuoteAnswers } from "@/lib/cotizador/types";

function answers(overrides: Partial<QuoteAnswers> = {}): QuoteAnswers {
  return {
    model: "iPhone 15 Pro",
    storage: "128",
    screenCondition: "perfect",
    backCondition: "perfect",
    frameCondition: "perfect",
    hasLiquidDamage: false,
    batteryHealth: "good",
    originalParts: { screen: true, battery: true },
    hasOriginalBox: true,
    functionalityIssues: {
      faceId: false,
      camera: false,
      audio: false,
      charging: false,
    },
    ...overrides,
  };
}

describe("quote draft validation", () => {
  it("copies the demo prices and penalties without adding models", () => {
    const draft = demoQuoteDraft();
    const parsed = parseDraftInput(draft);
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.equal(parsed.value.prices.length, 56);
    assert.equal(parsed.value.penalties.length, 13);
    const pro = parsed.value.prices.find(
      (price) => price.model === "iPhone 15 Pro" && price.storage === "128",
    );
    assert.equal(pro?.priceUsd, 420);
    const box = parsed.value.penalties.find((penalty) => penalty.key === "noOriginalBox");
    assert.equal(box?.kind, "FIXED_USD");
    assert.equal(box?.value, 20);
    const screen = parsed.value.penalties.find((penalty) => penalty.key === "screenCracked");
    assert.equal(screen?.value, 0.5);
  });

  it("ignores a publish flag sent with the draft", () => {
    const parsed = parseDraftInput({
      ...demoQuoteDraft(),
      status: "PUBLISHED",
      publishedAt: "2026-10-15",
    });
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.equal("status" in parsed.value, false);
  });

  it("rejects an unknown penalty and accepts a switch between percent and USD", () => {
    const draft = demoQuoteDraft();
    const extra = parseDraftInput({
      ...draft,
      penalties: [...draft.penalties, { key: "icloud", kind: "PERCENTAGE", value: 0.1 }],
    });
    assert.equal(extra.ok, false);

    const asUsd = parseDraftInput({
      ...draft,
      penalties: draft.penalties.map((penalty) =>
        penalty.key === "screenCracked" ? { ...penalty, kind: "FIXED_USD", value: 210 } : penalty,
      ),
    });
    assert.equal(asUsd.ok, true);
    if (!asUsd.ok) return;
    const screen = asUsd.value.penalties.find((penalty) => penalty.key === "screenCracked");
    assert.equal(screen?.kind, "FIXED_USD");
    assert.equal(screen?.value, 210);

    const asPercent = parseDraftInput({
      ...draft,
      penalties: draft.penalties.map((penalty) =>
        penalty.key === "noOriginalBox" ? { ...penalty, kind: "PERCENTAGE", value: 0.1 } : penalty,
      ),
    });
    assert.equal(asPercent.ok, true);
    if (!asPercent.ok) return;
    const box = asPercent.value.penalties.find((penalty) => penalty.key === "noOriginalBox");
    assert.equal(box?.kind, "PERCENTAGE");
    assert.equal(box?.value, 0.1);
  });

  it("rejects a price outside the demo model list", () => {
    const draft = demoQuoteDraft();
    const parsed = parseDraftInput({
      ...draft,
      prices: draft.prices.map((price, index) =>
        index === 0 ? { ...price, model: "iPhone 17 Pro" } : price,
      ),
    });
    assert.equal(parsed.ok, false);
  });
});

describe("draft preview stays off the public calculation", () => {
  it("uses the draft only when it is passed explicitly", () => {
    const draft = demoQuoteDraft();
    draft.prices = draft.prices.map((price) =>
      price.model === "iPhone 15 Pro" && price.storage === "128"
        ? { ...price, priceUsd: 999 }
        : price,
    );
    const preview = previewDraftCalculation(draft, {
      ...answers(),
      finalPrice: 1,
      cost: 50,
    });
    assert.equal(preview.ok, true);
    if (!preview.ok) return;
    assert.equal(preview.price.basePrice, 999);
    assert.equal(preview.price.finalPrice, 1000);
    assert.equal(calculatePrice(answers())?.finalPrice, 420);
    assert.equal(toEngineConfig(demoQuoteDraft()).prices.find((price) => price.model === "iPhone 15 Pro" && price.storage === "128")?.price, 420);
  });

  it("matches the known demo results when the draft is unchanged", () => {
    const impeccable = previewDraftCalculation(demoQuoteDraft(), answers());
    const battery = previewDraftCalculation(demoQuoteDraft(), answers({ batteryHealth: "low" }));
    const cracked = previewDraftCalculation(demoQuoteDraft(), answers({ screenCondition: "cracked" }));
    const box = previewDraftCalculation(demoQuoteDraft(), answers({ hasOriginalBox: false }));
    assert.equal(impeccable.ok && impeccable.price.finalPrice, 420);
    assert.equal(battery.ok && battery.price.finalPrice, 355);
    assert.equal(cracked.ok && cracked.price.finalPrice, 210);
    assert.equal(box.ok && box.price.finalPrice, 400);
  });
});

describe("admin wiring", () => {
  it("detects a missing quote table without treating every error as pending", () => {
    assert.equal(isMissingQuoteTable({ code: "P2021" }), true);
    assert.equal(isMissingQuoteTable(new Error("relation QuotePricingRevision does not exist")), true);
    assert.equal(isMissingQuoteTable(new Error("connection refused")), false);
    assert.equal(
      isMissingQuoteTable(new TypeError("Cannot read properties of undefined (reading 'findMany')")),
      true,
    );
  });

  it("keeps a saved draft from replacing the public configuration by itself", () => {
    const quote = readFileSync("lib/cotizador/quote.ts", "utf8");
    const actions = readFileSync("lib/cotizador/pricing-actions.ts", "utf8");
    const admin = readFileSync("lib/cotizador/pricing-admin.ts", "utf8");
    const publish = readFileSync("lib/cotizador/pricing-publish.ts", "utf8");
    assert.match(quote, /loadActiveQuoteConfig\(\)/);
    assert.match(quote, /calculatePrice\(parsed\.value\.answers, active\.config\)/);
    assert.equal(quote.includes("pricing-admin"), false);
    assert.equal(actions.includes("prisma"), false);
    assert.match(admin, /status: "DRAFT"/);
    assert.equal(admin.includes("status: \"PUBLISHED\""), false);
    assert.match(publish, /requireAdmin\(\)/);
    assert.match(publish, /confirm !== true/);
    assert.match(publish, /\$transaction/);
  });
});
