import { NextResponse } from "next/server";
import {
  fetchInstallmentOptions,
  publishedProductArs,
} from "@/lib/mercadopago";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const productId = new URL(request.url).searchParams.get("productId")?.trim();
  if (!productId) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const priced = await publishedProductArs(productId);
  if (!priced) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  try {
    const options = await fetchInstallmentOptions(priced.arsAmount);
    if (!options) {
      return NextResponse.json({ ok: false }, { status: 503 });
    }
    return NextResponse.json({
      ok: true,
      arsAmount: priced.arsAmount,
      options,
    });
  } catch (error) {
    console.error("[mercadopago] installments", error);
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
