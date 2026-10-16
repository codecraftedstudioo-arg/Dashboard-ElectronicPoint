import { NextResponse } from "next/server";
import { createQuote } from "@/lib/cotizador/quote";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Los datos de la cotización no son válidos." },
      { status: 400 },
    );
  }

  const result = await createQuote(body);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
