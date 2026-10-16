import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculatePrice, demoConfig } from "@/lib/cotizador/pricing-engine";
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

describe("calculatePrice demo values", () => {
  it("returns the demo base for an impeccable iPhone 15 Pro 128", () => {
    const result = calculatePrice(answers());
    assert.ok(result);
    assert.equal(result.basePrice, 420);
    assert.equal(result.finalPrice, 420);
    assert.equal(result.deductionBreakdown.length, 0);
  });

  it("applies the 15% battery penalty and rounds to 5", () => {
    const result = calculatePrice(answers({ batteryHealth: "low" }));
    assert.ok(result);
    assert.equal(result.finalPrice, 355);
  });

  it("applies the 50% cracked-screen penalty", () => {
    const result = calculatePrice(answers({ screenCondition: "cracked" }));
    assert.ok(result);
    assert.equal(result.finalPrice, 210);
  });

  it("subtracts the fixed 20 USD box penalty", () => {
    const result = calculatePrice(answers({ hasOriginalBox: false }));
    assert.ok(result);
    assert.equal(result.finalPrice, 400);
  });

  it("applies a cracked screen as a fixed USD amount when configured that way", () => {
    const result = calculatePrice(answers({ screenCondition: "cracked" }), {
      ...demoConfig,
      penalties: {
        ...demoConfig.penalties,
        screenCracked: { type: "fixed_usd", value: 100, overrides: {} },
      },
    });
    assert.ok(result);
    assert.equal(result.basePrice, 420);
    assert.equal(result.finalPrice, 320);
  });

  it("combines cracked screen and non-original screen as 75%", () => {
    const result = calculatePrice(
      answers({
        screenCondition: "cracked",
        originalParts: { screen: false, battery: true },
      }),
    );
    assert.ok(result);
    assert.equal(result.finalPrice, 105);
  });

  it("does not go below zero", () => {
    const result = calculatePrice(
      answers({
        screenCondition: "cracked",
        backCondition: "cracked",
        frameCondition: "damaged",
        hasLiquidDamage: true,
        batteryHealth: "low",
        originalParts: { screen: false, battery: false },
        hasOriginalBox: false,
        functionalityIssues: {
          faceId: true,
          camera: true,
          audio: true,
          charging: true,
        },
      }),
    );
    assert.ok(result);
    assert.equal(result.finalPrice, 0);
  });

  it("returns null for a model that is not in the demo list", () => {
    assert.equal(calculatePrice(answers({ model: "iPhone 17 Pro" })), null);
  });
});
