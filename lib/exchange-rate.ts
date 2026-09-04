export type BlueVentaRate = {
  usdToArs: number;
  source: "DolarHoy";
  type: "blue";
  rateType: "venta";
  updatedAt: string;
  /** True when returning a previously cached rate after a fetch failure. */
  stale?: boolean;
};

const DOLAR_API_BLUE_URL = "https://dolarapi.com/v1/dolares/blue";
const CACHE_TTL_MS = 5 * 60 * 1000;

type CacheEntry = {
  rate: BlueVentaRate;
  fetchedAt: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __blueVentaRateCache: CacheEntry | undefined;
}

function getCache(): CacheEntry | undefined {
  return globalThis.__blueVentaRateCache;
}

function setCache(entry: CacheEntry) {
  globalThis.__blueVentaRateCache = entry;
}

function parseRate(payload: unknown): BlueVentaRate | null {
  if (!payload || typeof payload !== "object") return null;
  const data = payload as {
    venta?: unknown;
    fechaActualizacion?: unknown;
  };
  const venta = Number(data.venta);
  if (!Number.isFinite(venta) || venta <= 0) return null;
  const updatedAt =
    typeof data.fechaActualizacion === "string" && data.fechaActualizacion
      ? data.fechaActualizacion
      : new Date().toISOString();

  return {
    usdToArs: venta,
    source: "DolarHoy",
    type: "blue",
    rateType: "venta",
    updatedAt,
  };
}

/**
 * Single source of truth for Dólar Blue VENTA (DolarHoy via dolarapi.com).
 * Cached ~5 minutes. On failure returns last good cache (stale) or null.
 */
export async function getBlueVentaRate(): Promise<BlueVentaRate | null> {
  const now = Date.now();
  const cached = getCache();
  if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.rate;
  }

  try {
    const response = await fetch(DOLAR_API_BLUE_URL, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });
    if (!response.ok) {
      throw new Error(`Exchange rate HTTP ${response.status}`);
    }
    const rate = parseRate(await response.json());
    if (!rate) {
      throw new Error("Exchange rate payload inválido");
    }
    setCache({ rate, fetchedAt: now });
    return rate;
  } catch (error) {
    console.error("[exchange-rate]", error);
    if (cached) {
      return { ...cached.rate, stale: true };
    }
    return null;
  }
}

export function convertUsdToArs(usdAmount: number, usdToArs: number): number {
  return usdAmount * usdToArs;
}

export function formatBlueRate(usdToArs: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(Math.round(usdToArs));
}

export function formatRateUpdatedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
