-- Track whether the product includes its original box.
ALTER TABLE "public"."Product" ADD COLUMN "hasBox" BOOLEAN NOT NULL DEFAULT true;
