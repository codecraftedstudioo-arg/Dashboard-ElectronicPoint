import { convertUsdToArs, getBlueVentaRate } from "@/lib/exchange-rate";
import { PUBLIC_CATALOG_ORIGIN } from "@/lib/domains";
import { buildProductSlug } from "@/lib/product-slug";
import { getPublishedIphoneById } from "@/lib/public-catalog";

const INSTALLMENT_METHODS = ["visa", "master", "amex", "naranja"] as const;
const PREFERRED_INSTALLMENTS = [3, 6, 12];

export type InstallmentOption = {
  installments: number;
  installmentAmount: number;
  totalAmount: number;
  interestFree: boolean;
};

type PayerCost = {
  installments?: number;
  installment_rate?: number;
  installment_amount?: number;
  total_amount?: number;
};

type InstallmentsPayload = {
  payer_costs?: PayerCost[];
};

export function salePriceArs(usdAmount: number, usdToArs: number): number {
  return Math.round(convertUsdToArs(usdAmount, usdToArs));
}

export function formatArsAmount(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}

export function pickInstallmentOptions(
  costs: PayerCost[],
): InstallmentOption[] {
  const byCount = new Map<number, InstallmentOption>();

  for (const cost of costs) {
    const installments = cost.installments;
    const installmentAmount = cost.installment_amount;
    const totalAmount = cost.total_amount;
    if (
      installments == null ||
      installmentAmount == null ||
      totalAmount == null ||
      installments < 2
    ) {
      continue;
    }

    const option: InstallmentOption = {
      installments,
      installmentAmount,
      totalAmount,
      interestFree: (cost.installment_rate ?? 0) === 0,
    };
    const current = byCount.get(installments);
    if (
      !current ||
      (option.interestFree && !current.interestFree) ||
      option.installmentAmount < current.installmentAmount
    ) {
      byCount.set(installments, option);
    }
  }

  const all = [...byCount.values()].sort(
    (a, b) => a.installments - b.installments,
  );
  const preferred = PREFERRED_INSTALLMENTS.map((count) =>
    all.find((option) => option.installments === count),
  ).filter((option): option is InstallmentOption => Boolean(option));

  return (preferred.length ? preferred : all).slice(0, 4);
}

export async function publishedProductArs(productId: string) {
  const product = await getPublishedIphoneById(productId);
  if (!product) return null;

  const rate = await getBlueVentaRate();
  if (!rate) return null;

  const arsAmount = salePriceArs(product.salePrice, rate.usdToArs);
  if (!Number.isFinite(arsAmount) || arsAmount <= 0) return null;

  return { product, arsAmount };
}

function credentials() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
  const publicKey = process.env.MERCADOPAGO_PUBLIC_KEY?.trim();
  if (!accessToken || !publicKey) return null;
  return { accessToken, publicKey };
}

export async function fetchInstallmentOptions(arsAmount: number) {
  const keys = credentials();
  if (!keys) return null;

  const responses = await Promise.all(
    INSTALLMENT_METHODS.map(async (method) => {
      const url = new URL(
        "https://api.mercadopago.com/v1/payment_methods/installments",
      );
      url.searchParams.set("public_key", keys.publicKey);
      url.searchParams.set("amount", String(arsAmount));
      url.searchParams.set("payment_method_id", method);

      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) return [];
      const payload = (await response.json()) as
        | InstallmentsPayload[]
        | InstallmentsPayload;
      const rows = Array.isArray(payload) ? payload : [payload];
      return rows.flatMap((row) => row.payer_costs ?? []);
    }),
  );

  if (responses.every((costs) => costs.length === 0)) return null;
  return pickInstallmentOptions(responses.flat());
}

export async function createCheckoutLink(productId: string) {
  const keys = credentials();
  if (!keys) return null;

  const priced = await publishedProductArs(productId);
  if (!priced) return null;

  const { product, arsAmount } = priced;
  const returnUrl = `${PUBLIC_CATALOG_ORIGIN}/${buildProductSlug(product)}`;
  const response = await fetch(
    "https://api.mercadopago.com/checkout/preferences",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${keys.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [
          {
            id: product.id,
            title: `${product.name} ${product.storage}`.slice(0, 256),
            quantity: 1,
            currency_id: "ARS",
            unit_price: arsAmount,
          },
        ],
        payment_methods: { installments: 12 },
        external_reference: product.id,
        back_urls: {
          success: returnUrl,
          pending: returnUrl,
          failure: returnUrl,
        },
        auto_return: "approved",
      }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    console.error("[mercadopago] preference", response.status);
    return null;
  }

  const preference = (await response.json()) as {
    init_point?: string;
    sandbox_init_point?: string;
  };
  const initPoint = preference.init_point || preference.sandbox_init_point;
  if (!initPoint) return null;

  return { initPoint, arsAmount };
}
