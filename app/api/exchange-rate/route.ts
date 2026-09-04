import { NextResponse } from "next/server";
import { getBlueVentaRate } from "@/lib/exchange-rate";

export const dynamic = "force-dynamic";

export async function GET() {
  const rate = await getBlueVentaRate();
  if (!rate) {
    return NextResponse.json(
      { ok: false, message: "No se pudo actualizar la cotización" },
      { status: 503 },
    );
  }
  return NextResponse.json({ ok: true, rate });
}
