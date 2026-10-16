import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculatePrice } from "@/lib/cotizador/pricing-engine";
import { toPublicTradeTarget } from "@/lib/cotizador/trade-target";
import { parseQuoteInput } from "@/lib/cotizador/validate";
import type { QuoteAnswers } from "@/lib/cotizador/types";

const validBody = {
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
  price: 1,
  basePrice: 1,
  finalPrice: 9999,
  salePrice: 1,
  cost: 1,
  contactName: "Ana",
  contactPhone: "1111111111",
};

describe("parseQuoteInput", () => {
  it("ignores prices and personal data sent by the browser", () => {
    const parsed = parseQuoteInput({ ...validBody });
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    const price = calculatePrice(parsed.value.answers);
    assert.ok(price);
    assert.equal(price.finalPrice, 420);
    assert.equal("contactName" in parsed.value.answers, false);
    assert.equal(parsed.value.equipo, undefined);
  });

  it("rejects an unknown model", () => {
    const parsed = parseQuoteInput({ ...validBody, model: "iPhone 17 Pro" });
    assert.equal(parsed.ok, false);
  });

  it("rejects a storage that does not belong to the model", () => {
    const parsed = parseQuoteInput({
      ...validBody,
      model: "iPhone 15 Pro Max",
      storage: "128",
    });
    assert.equal(parsed.ok, false);
  });

  it("rejects a missing condition", () => {
    const parsed = parseQuoteInput({ ...validBody, screenCondition: "broken" });
    assert.equal(parsed.ok, false);
  });

  it("keeps a short equipo slug and drops a price next to it", () => {
    const parsed = parseQuoteInput({
      ...validBody,
      equipo: "iphone-16-pro-max-256gb--abc",
      upgradePrice: 10,
    });
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    assert.equal(parsed.value.equipo, "iphone-16-pro-max-256gb--abc");
  });
});

describe("toPublicTradeTarget", () => {
  const published = {
    type: "IPHONE",
    status: "AVAILABLE",
    isPublished: true,
    isReserved: false,
    name: "iPhone 16 Pro Max",
    storage: "256GB",
    color: "Dessert",
    salePrice: 850,
    batteryCondition: 91,
    cost: 650,
    imei: "359447967578105",
    internalCode: "EP-0069",
  };

  it("returns only public fields for an available published iPhone", () => {
    const target = toPublicTradeTarget(published);
    assert.deepEqual(target, {
      name: "iPhone 16 Pro Max",
      storage: "256GB",
      color: "Dessert",
      salePrice: 850,
      batteryCondition: 91,
    });
  });

  it("hides reserved, sold, hidden, missing and non-iPhone products", () => {
    assert.equal(toPublicTradeTarget({ ...published, isReserved: true }), null);
    assert.equal(toPublicTradeTarget({ ...published, status: "SOLD" }), null);
    assert.equal(toPublicTradeTarget({ ...published, isPublished: false }), null);
    assert.equal(toPublicTradeTarget({ ...published, type: "MACBOOK" }), null);
    assert.equal(toPublicTradeTarget(null), null);
  });
});

describe("quote answers stay independent of client amounts", () => {
  it("does not read a client final price from the answer type", () => {
    const parsed = parseQuoteInput(validBody);
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    const answers: QuoteAnswers = parsed.value.answers;
    assert.equal(calculatePrice(answers)?.basePrice, 420);
  });
});
