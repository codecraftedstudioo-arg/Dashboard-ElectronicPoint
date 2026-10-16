-- CreateEnum
CREATE TYPE "QuoteRevisionStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "QuotePenaltyKind" AS ENUM ('PERCENTAGE', 'FIXED_USD');

-- CreateTable
CREATE TABLE "QuotePricingRevision" (
    "id" TEXT NOT NULL,
    "status" "QuoteRevisionStatus" NOT NULL DEFAULT 'DRAFT',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "note" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "publishedBy" TEXT,

    CONSTRAINT "QuotePricingRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteBasePrice" (
    "id" TEXT NOT NULL,
    "revisionId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "storage" TEXT NOT NULL,
    "priceUsd" INTEGER NOT NULL,

    CONSTRAINT "QuoteBasePrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuotePenalty" (
    "id" TEXT NOT NULL,
    "revisionId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "kind" "QuotePenaltyKind" NOT NULL,
    "value" DECIMAL(12,4) NOT NULL,

    CONSTRAINT "QuotePenalty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuotePricingRevision_status_createdAt_idx" ON "QuotePricingRevision"("status", "createdAt");

-- CreateIndex
CREATE INDEX "QuoteBasePrice_revisionId_idx" ON "QuoteBasePrice"("revisionId");

-- CreateIndex
CREATE UNIQUE INDEX "QuoteBasePrice_revisionId_model_storage_key" ON "QuoteBasePrice"("revisionId", "model", "storage");

-- CreateIndex
CREATE INDEX "QuotePenalty_revisionId_idx" ON "QuotePenalty"("revisionId");

-- CreateIndex
CREATE UNIQUE INDEX "QuotePenalty_revisionId_key_key" ON "QuotePenalty"("revisionId", "key");

-- AddForeignKey
ALTER TABLE "QuoteBasePrice" ADD CONSTRAINT "QuoteBasePrice_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "QuotePricingRevision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuotePenalty" ADD CONSTRAINT "QuotePenalty_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES "QuotePricingRevision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Initial draft copied from lib/cotizador/demo-pricing.json. Status stays DRAFT.
INSERT INTO "QuotePricingRevision" ("id", "status", "currency", "note", "createdBy", "createdAt", "updatedAt", "publishedAt", "publishedBy")
VALUES ('demo-json-draft', 'DRAFT', 'USD', 'Copia inicial del JSON de demostración. No está publicada.', 'demostracion', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL, NULL);

INSERT INTO "QuoteBasePrice" ("id", "revisionId", "model", "storage", "priceUsd") VALUES
('demo-json-draft-price-01', 'demo-json-draft', 'iPhone 13', '128', 200),
('demo-json-draft-price-02', 'demo-json-draft', 'iPhone 13', '256', 230),
('demo-json-draft-price-03', 'demo-json-draft', 'iPhone 13', '512', 240),
('demo-json-draft-price-04', 'demo-json-draft', 'iPhone 13 mini', '128', 150),
('demo-json-draft-price-05', 'demo-json-draft', 'iPhone 13 mini', '256', 170),
('demo-json-draft-price-06', 'demo-json-draft', 'iPhone 13 mini', '512', 180),
('demo-json-draft-price-07', 'demo-json-draft', 'iPhone 13 Pro', '128', 200),
('demo-json-draft-price-08', 'demo-json-draft', 'iPhone 13 Pro', '256', 220),
('demo-json-draft-price-09', 'demo-json-draft', 'iPhone 13 Pro', '512', 270),
('demo-json-draft-price-10', 'demo-json-draft', 'iPhone 13 Pro', '1024', 320),
('demo-json-draft-price-11', 'demo-json-draft', 'iPhone 13 Pro Max', '128', 250),
('demo-json-draft-price-12', 'demo-json-draft', 'iPhone 13 Pro Max', '256', 300),
('demo-json-draft-price-13', 'demo-json-draft', 'iPhone 13 Pro Max', '512', 350),
('demo-json-draft-price-14', 'demo-json-draft', 'iPhone 13 Pro Max', '1024', 400),
('demo-json-draft-price-15', 'demo-json-draft', 'iPhone 14', '128', 220),
('demo-json-draft-price-16', 'demo-json-draft', 'iPhone 14', '256', 250),
('demo-json-draft-price-17', 'demo-json-draft', 'iPhone 14', '512', 290),
('demo-json-draft-price-18', 'demo-json-draft', 'iPhone 14 Plus', '128', 250),
('demo-json-draft-price-19', 'demo-json-draft', 'iPhone 14 Plus', '256', 300),
('demo-json-draft-price-20', 'demo-json-draft', 'iPhone 14 Plus', '512', 350),
('demo-json-draft-price-21', 'demo-json-draft', 'iPhone 14 Pro', '128', 270),
('demo-json-draft-price-22', 'demo-json-draft', 'iPhone 14 Pro', '256', 300),
('demo-json-draft-price-23', 'demo-json-draft', 'iPhone 14 Pro', '512', 350),
('demo-json-draft-price-24', 'demo-json-draft', 'iPhone 14 Pro', '1024', 400),
('demo-json-draft-price-25', 'demo-json-draft', 'iPhone 14 Pro Max', '128', 300),
('demo-json-draft-price-26', 'demo-json-draft', 'iPhone 14 Pro Max', '256', 350),
('demo-json-draft-price-27', 'demo-json-draft', 'iPhone 14 Pro Max', '512', 400),
('demo-json-draft-price-28', 'demo-json-draft', 'iPhone 14 Pro Max', '1024', 450),
('demo-json-draft-price-29', 'demo-json-draft', 'iPhone 15', '128', 350),
('demo-json-draft-price-30', 'demo-json-draft', 'iPhone 15', '256', 400),
('demo-json-draft-price-31', 'demo-json-draft', 'iPhone 15', '512', 450),
('demo-json-draft-price-32', 'demo-json-draft', 'iPhone 15 Plus', '128', 370),
('demo-json-draft-price-33', 'demo-json-draft', 'iPhone 15 Plus', '256', 420),
('demo-json-draft-price-34', 'demo-json-draft', 'iPhone 15 Plus', '512', 450),
('demo-json-draft-price-35', 'demo-json-draft', 'iPhone 15 Pro', '128', 420),
('demo-json-draft-price-36', 'demo-json-draft', 'iPhone 15 Pro', '256', 450),
('demo-json-draft-price-37', 'demo-json-draft', 'iPhone 15 Pro', '512', 500),
('demo-json-draft-price-38', 'demo-json-draft', 'iPhone 15 Pro', '1024', 550),
('demo-json-draft-price-39', 'demo-json-draft', 'iPhone 15 Pro Max', '256', 500),
('demo-json-draft-price-40', 'demo-json-draft', 'iPhone 15 Pro Max', '512', 550),
('demo-json-draft-price-41', 'demo-json-draft', 'iPhone 15 Pro Max', '1024', 600),
('demo-json-draft-price-42', 'demo-json-draft', 'iPhone 16e', '128', 300),
('demo-json-draft-price-43', 'demo-json-draft', 'iPhone 16e', '256', 350),
('demo-json-draft-price-44', 'demo-json-draft', 'iPhone 16', '128', 400),
('demo-json-draft-price-45', 'demo-json-draft', 'iPhone 16', '256', 450),
('demo-json-draft-price-46', 'demo-json-draft', 'iPhone 16', '512', 500),
('demo-json-draft-price-47', 'demo-json-draft', 'iPhone 16 Plus', '128', 450),
('demo-json-draft-price-48', 'demo-json-draft', 'iPhone 16 Plus', '256', 500),
('demo-json-draft-price-49', 'demo-json-draft', 'iPhone 16 Plus', '512', 550),
('demo-json-draft-price-50', 'demo-json-draft', 'iPhone 16 Pro', '128', 600),
('demo-json-draft-price-51', 'demo-json-draft', 'iPhone 16 Pro', '256', 650),
('demo-json-draft-price-52', 'demo-json-draft', 'iPhone 16 Pro', '512', 700),
('demo-json-draft-price-53', 'demo-json-draft', 'iPhone 16 Pro', '1024', 830),
('demo-json-draft-price-54', 'demo-json-draft', 'iPhone 16 Pro Max', '256', 700),
('demo-json-draft-price-55', 'demo-json-draft', 'iPhone 16 Pro Max', '512', 750),
('demo-json-draft-price-56', 'demo-json-draft', 'iPhone 16 Pro Max', '1024', 800);

INSERT INTO "QuotePenalty" ("id", "revisionId", "key", "kind", "value") VALUES
('demo-json-draft-penalty-01', 'demo-json-draft', 'screenCracked', 'PERCENTAGE', 0.5000),
('demo-json-draft-penalty-02', 'demo-json-draft', 'screenScratches', 'PERCENTAGE', 0.0500),
('demo-json-draft-penalty-03', 'demo-json-draft', 'backCracked', 'PERCENTAGE', 0.2000),
('demo-json-draft-penalty-04', 'demo-json-draft', 'frameDamaged', 'PERCENTAGE', 0.0800),
('demo-json-draft-penalty-05', 'demo-json-draft', 'liquidDamage', 'PERCENTAGE', 0.2000),
('demo-json-draft-penalty-06', 'demo-json-draft', 'batteryBelow85', 'PERCENTAGE', 0.1500),
('demo-json-draft-penalty-07', 'demo-json-draft', 'batteryNotOriginal', 'PERCENTAGE', 0.1500),
('demo-json-draft-penalty-08', 'demo-json-draft', 'screenNotOriginal', 'PERCENTAGE', 0.2500),
('demo-json-draft-penalty-09', 'demo-json-draft', 'faceIdNotWorking', 'PERCENTAGE', 0.3000),
('demo-json-draft-penalty-10', 'demo-json-draft', 'cameraNotWorking', 'PERCENTAGE', 0.3000),
('demo-json-draft-penalty-11', 'demo-json-draft', 'audioNotWorking', 'PERCENTAGE', 0.1500),
('demo-json-draft-penalty-12', 'demo-json-draft', 'chargingNotWorking', 'PERCENTAGE', 0.3000),
('demo-json-draft-penalty-13', 'demo-json-draft', 'noOriginalBox', 'FIXED_USD', 20.0000);
