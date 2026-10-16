-- Mark selected published iPhones for the public Oportunidades carousel.
ALTER TABLE "public"."Product" ADD COLUMN "isOpportunity" BOOLEAN NOT NULL DEFAULT false;
