import { NextResponse } from "next/server";
import { createCheckoutLink } from "@/lib/mercadopago";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let productId = "";
  try {
    const body = (await request.json()) as { productId?: unknown };
    productId = typeof body.productId === "string" ? body.productId.trim() : "";
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!productId) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  try {
    const checkout = await createCheckoutLink(productId);
    if (!checkout) {
      return NextResponse.json({ ok: false }, { status: 503 });
    }
    return NextResponse.json({ ok: true, initPoint: checkout.initPoint });
  } catch (error) {
    console.error("[mercadopago] checkout", error);
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
