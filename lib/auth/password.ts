import { createHash, timingSafeEqual } from "node:crypto";

export function hasDashboardPassword(): boolean {
  return Boolean(process.env.DASHBOARD_PASSWORD);
}

/** Compares digests so the check does not leak the secret or its length. */
export function passwordMatches(input: string): boolean {
  const expected = process.env.DASHBOARD_PASSWORD;
  if (!expected || !input) return false;
  const actualDigest = createHash("sha256").update(input, "utf8").digest();
  const expectedDigest = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(actualDigest, expectedDigest);
}
