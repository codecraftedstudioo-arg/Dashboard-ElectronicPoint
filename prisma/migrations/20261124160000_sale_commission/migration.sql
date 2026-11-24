-- Store per-sale commission and optional seller, linked to commission payments.
ALTER TABLE "public"."Sale" ADD COLUMN "commission" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "public"."Sale" ADD COLUMN "seller" "public"."SellerName";

ALTER TABLE "public"."SellerCommission" ADD COLUMN "saleId" TEXT;

CREATE UNIQUE INDEX "SellerCommission_saleId_key" ON "public"."SellerCommission"("saleId");

ALTER TABLE "public"."SellerCommission" ADD CONSTRAINT "SellerCommission_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "public"."Sale"("id") ON DELETE CASCADE ON UPDATE CASCADE;
