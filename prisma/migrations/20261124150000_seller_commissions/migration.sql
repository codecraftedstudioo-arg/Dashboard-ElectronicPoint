-- Track commission payments to sellers.
CREATE TYPE "public"."SellerName" AS ENUM ('RAMI', 'SABRY', 'TOBI');

CREATE TABLE "public"."SellerCommission" (
    "id" TEXT NOT NULL,
    "seller" "public"."SellerName" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SellerCommission_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SellerCommission_seller_paidAt_idx" ON "public"."SellerCommission"("seller", "paidAt");
