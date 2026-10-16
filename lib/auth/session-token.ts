export const SESSION_COOKIE = "dashboard_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

const SALT = "usados-premium-dashboard";
const INFO = "session-cookie-v1";

type SessionPayload = { v: 1; exp: number };

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64UrlToBytes(value: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return null;
  const pad = value.length % 4 === 0 ? "" : "=".repeat(4 - (value.length % 4));
  try {
    const binary = atob(value.replaceAll("-", "+").replaceAll("_", "/") + pad);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
  } catch {
    return null;
  }
}

async function signingKey(secret: string): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    "HKDF",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new TextEncoder().encode(SALT),
      info: new TextEncoder().encode(INFO),
    },
    baseKey,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export function sessionCookieOptions(maxAge = SESSION_MAX_AGE_SECONDS) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

/** Signed, expiring session. The cookie is not the password. */
export async function createSessionToken(now = Date.now()): Promise<string | null> {
  const secret = process.env.DASHBOARD_PASSWORD;
  if (!secret) return null;
  const payload: SessionPayload = {
    v: 1,
    exp: Math.floor(now / 1000) + SESSION_MAX_AGE_SECONDS,
  };
  const body = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await signingKey(secret);
  const signature = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body)),
  );
  return `${body}.${bytesToBase64Url(signature)}`;
}

export async function verifySessionToken(
  token: string | undefined | null,
  now = Date.now(),
): Promise<boolean> {
  const secret = process.env.DASHBOARD_PASSWORD;
  if (!secret || !token || token === secret) return false;
  const separator = token.indexOf(".");
  if (separator <= 0 || separator !== token.lastIndexOf(".")) return false;
  const body = token.slice(0, separator);
  const signature = base64UrlToBytes(token.slice(separator + 1));
  const payloadBytes = base64UrlToBytes(body);
  if (!signature || !payloadBytes) return false;

  const key = await signingKey(secret);
  const signatureCopy = new ArrayBuffer(signature.byteLength);
  new Uint8Array(signatureCopy).set(signature);
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    signatureCopy,
    new TextEncoder().encode(body),
  );
  if (!valid) return false;

  try {
    const payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as {
      v?: unknown;
      exp?: unknown;
    };
    if (payload.v !== 1 || typeof payload.exp !== "number" || !Number.isFinite(payload.exp)) {
      return false;
    }
    const nowSeconds = Math.floor(now / 1000);
    if (payload.exp <= nowSeconds) return false;
    if (payload.exp > nowSeconds + SESSION_MAX_AGE_SECONDS + 60) return false;
    return true;
  } catch {
    return false;
  }
}
