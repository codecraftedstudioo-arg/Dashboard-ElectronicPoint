/**
 * IMEI helpers for form + barcode scanner.
 * Business rules stay light to match existing optional IMEI field.
 */

/** Strip spaces, dashes, and non-digits. */
export function normalizeImeiDigits(raw: string): string {
  return String(raw ?? "").replace(/\D/g, "");
}

/** True when value is exactly 15 digits. */
export function isValidImeiFormat(imei: string): boolean {
  return /^\d{15}$/.test(imei);
}

/**
 * Extract a 15-digit IMEI from barcode/OCR-like text.
 * Prefers an exact 15-digit payload; otherwise first 15 consecutive digits.
 */
export function extractImei(raw: string): string | null {
  const digits = normalizeImeiDigits(raw);
  if (digits.length === 15) return digits;
  const match = digits.match(/\d{15}/);
  return match?.[0] ?? null;
}

/**
 * Luhn check used by IMEI check digits.
 * Available if we need stricter validation later; scanner currently requires format.
 */
export function isValidImeiLuhn(imei: string): boolean {
  if (!isValidImeiFormat(imei)) return false;
  let sum = 0;
  for (let i = 0; i < 15; i++) {
    let digit = Number(imei[14 - i]);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

export function isValidImei(imei: string): boolean {
  return isValidImeiFormat(imei);
}
