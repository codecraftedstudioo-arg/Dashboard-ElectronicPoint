import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { PrismaClient } from "@prisma/client";
import { createQuote } from "@/lib/cotizador/quote";
import { demoQuoteDraft } from "@/lib/cotizador/pricing-draft";
import {
  activateStoredRevision,
  deactivateStoredRevision,
} from "@/lib/cotizador/pricing-publish";

const TEST_NOTE = "prueba-local-no-comercial";
const prisma = new PrismaClient();

const answers = {
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
  finalPrice: 9999,
  cost: 1,
};

async function inventoryCounts() {
  const [products, sales, images] = await Promise.all([
    prisma.product.count(),
    prisma.sale.count(),
    prisma.productImage.count(),
  ]);
  return { products, sales, images };
}

async function removeTestRevisions() {
  const live = await prisma.quotePricingRevision.findMany({
    where: { note: TEST_NOTE, status: "PUBLISHED" },
    select: { id: true },
  });
  for (const row of live) {
    await deactivateStoredRevision(row.id);
  }
  await prisma.quotePricingRevision.deleteMany({ where: { note: TEST_NOTE } });
}

async function createTestRevision(priceUsd: number) {
  const draft = demoQuoteDraft();
  draft.note = TEST_NOTE;
  draft.prices = draft.prices.map((price) =>
    price.model === "iPhone 15 Pro" && price.storage === "128"
      ? { ...price, priceUsd }
      : price,
  );
  return prisma.quotePricingRevision.create({
    data: {
      status: "DRAFT",
      currency: "USD",
      note: TEST_NOTE,
      createdBy: "prueba",
      basePrices: {
        create: draft.prices.map((price) => ({
          model: price.model,
          storage: price.storage,
          priceUsd: price.priceUsd,
        })),
      },
      penalties: {
        create: draft.penalties.map((penalty) => ({
          key: penalty.key,
          kind: penalty.kind,
          value: penalty.value.toFixed(4),
        })),
      },
    },
    select: { id: true },
  });
}

describe("quote publication against the database", () => {
  let beforeCounts: { products: number; sales: number; images: number };

  before(async () => {
    beforeCounts = await inventoryCounts();
    await removeTestRevisions();
    const published = await prisma.quotePricingRevision.count({
      where: { status: "PUBLISHED" },
    });
    assert.equal(published, 0);
  });

  after(async () => {
    await removeTestRevisions();
    const counts = await inventoryCounts();
    assert.deepEqual(counts, beforeCounts);
    const seed = await prisma.quotePricingRevision.findUnique({
      where: { id: "demo-json-draft" },
      include: { _count: { select: { basePrices: true, penalties: true } } },
    });
    assert.equal(seed?.status, "DRAFT");
    assert.equal(seed?.publishedAt, null);
    assert.equal(seed?._count.basePrices, 56);
    assert.equal(seed?._count.penalties, 13);
    const published = await prisma.quotePricingRevision.count({
      where: { status: "PUBLISHED" },
    });
    assert.equal(published, 0);
    await prisma.$disconnect();
  });

  it("keeps drafts private, switches the public price atomically, and restores the demo", async () => {
    const first = await createTestRevision(999);
    const draftQuote = await createQuote(answers);
    assert.equal(draftQuote.ok, true);
    if (!draftQuote.ok) return;
    assert.equal(draftQuote.demo, true);
    assert.equal(draftQuote.finalPrice, 370);
    assert.equal(draftQuote.basePrice, 420);

    const activated = await activateStoredRevision(first.id, "prueba");
    assert.equal(activated.ok, true);
    const commercial = await createQuote(answers);
    assert.equal(commercial.ok, true);
    if (!commercial.ok) return;
    assert.equal(commercial.demo, false);
    assert.equal(commercial.basePrice, 999);
    assert.equal(commercial.finalPrice, 950);

    const second = await createTestRevision(430);
    const switched = await activateStoredRevision(second.id, "prueba");
    assert.equal(switched.ok, true);
    const current = await prisma.quotePricingRevision.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true },
    });
    assert.deepEqual(current.map((row) => row.id), [second.id]);
    const previous = await prisma.quotePricingRevision.findUnique({
      where: { id: first.id },
      select: { status: true, publishedBy: true },
    });
    assert.equal(previous?.status, "DRAFT");
    assert.equal(previous?.publishedBy, "prueba");
    const switchedQuote = await createQuote(answers);
    assert.equal(switchedQuote.ok && switchedQuote.finalPrice, 380);

    const invalid = await prisma.quotePricingRevision.create({
      data: {
        status: "DRAFT",
        currency: "USD",
        note: TEST_NOTE,
        createdBy: "prueba",
        basePrices: {
          create: [{ model: "iPhone 15 Pro", storage: "128", priceUsd: 999 }],
        },
      },
      select: { id: true },
    });
    const rejected = await activateStoredRevision(invalid.id, "prueba");
    assert.equal(rejected.ok, false);
    const stillCurrent = await prisma.quotePricingRevision.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true },
    });
    assert.deepEqual(stillCurrent.map((row) => row.id), [second.id]);
    const unchanged = await createQuote(answers);
    assert.equal(unchanged.ok && unchanged.demo, false);
    assert.equal(unchanged.ok && unchanged.finalPrice, 380);

    const deactivated = await deactivateStoredRevision(second.id);
    assert.equal(deactivated.ok, true);
    const restored = await createQuote(answers);
    assert.equal(restored.ok, true);
    if (!restored.ok) return;
    assert.equal(restored.demo, true);
    assert.equal(restored.finalPrice, 370);

    const stored = await prisma.quotePricingRevision.findUnique({
      where: { id: first.id },
      include: { basePrices: true, penalties: true },
    });
    assert.equal(stored?.basePrices.length, 56);
    assert.equal(stored?.penalties.length, 13);
    assert.equal(
      stored?.basePrices.find((price) => price.model === "iPhone 15 Pro" && price.storage === "128")
        ?.priceUsd,
      999,
    );
  });
});
