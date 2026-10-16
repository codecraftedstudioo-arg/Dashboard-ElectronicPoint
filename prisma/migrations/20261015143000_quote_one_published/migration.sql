-- Only one commercial revision can be active. Drafts are unaffected.
CREATE UNIQUE INDEX "QuotePricingRevision_one_published_idx"
ON "QuotePricingRevision" ("status")
WHERE "status" = 'PUBLISHED';
