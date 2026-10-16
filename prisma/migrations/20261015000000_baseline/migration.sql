-- Baseline of the inventory schema already present in this database.
-- It is marked as applied and must not be executed against the existing data.
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."ChipType" AS ENUM ('SIM', 'ESIM');

-- CreateEnum
CREATE TYPE "public"."PhysicalCondition" AS ENUM ('IMPECABLE', 'EXCELENTE', 'MUY_BUENO', 'BUENO', 'CON_DETALLES');

-- CreateEnum
CREATE TYPE "public"."ProductStatus" AS ENUM ('AVAILABLE', 'SOLD', 'RESERVED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."ProductType" AS ENUM ('IPHONE', 'MACBOOK');

-- CreateEnum
CREATE TYPE "public"."SaleChannel" AS ENUM ('CLIENTE', 'FACEBOOK_MARKETPLACE', 'INSTAGRAM', 'REFERIDO', 'OTRO', 'GREMIO');

-- CreateTable
CREATE TABLE "public"."AppCounter" (
    "id" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AppCounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Product" (
    "id" TEXT NOT NULL,
    "internalCode" TEXT NOT NULL,
    "type" "public"."ProductType" NOT NULL,
    "name" TEXT NOT NULL,
    "storage" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "batteryCondition" INTEGER,
    "physicalCondition" "public"."PhysicalCondition" NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "salePrice" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "status" "public"."ProductStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "imei" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "chip" "public"."ChipType",
    "isReserved" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductImage" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Sale" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "soldPrice" DOUBLE PRECISION NOT NULL,
    "channel" "public"."SaleChannel" NOT NULL,
    "notes" TEXT,
    "soldAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Product_imei_idx" ON "public"."Product"("imei" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Product_internalCode_key" ON "public"."Product"("internalCode" ASC);

-- CreateIndex
CREATE INDEX "Product_status_isPublished_type_idx" ON "public"."Product"("status" ASC, "isPublished" ASC, "type" ASC);

-- CreateIndex
CREATE INDEX "ProductImage_productId_sortOrder_idx" ON "public"."ProductImage"("productId" ASC, "sortOrder" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Sale_productId_key" ON "public"."Sale"("productId" ASC);

-- AddForeignKey
ALTER TABLE "public"."ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Sale" ADD CONSTRAINT "Sale_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

