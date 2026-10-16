"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/session";
import { saveQuoteDraft } from "@/lib/cotizador/pricing-admin";
import { previewDraftCalculation } from "@/lib/cotizador/pricing-draft";
import {
  activateQuoteRevision,
  deactivateQuoteRevision,
} from "@/lib/cotizador/pricing-publish";

function refreshQuoteSurfaces() {
  revalidatePath("/cotizador");
  revalidatePath("/usados/cotizar-iphone");
  revalidatePath("/cotizar-iphone");
}

export async function saveQuoteDraftAction(input: unknown) {
  const result = await saveQuoteDraft(input);
  if (result.ok) revalidatePath("/cotizador");
  return result;
}

export async function activateQuoteRevisionAction(id: string, confirm: boolean) {
  const result = await activateQuoteRevision(id, confirm);
  if (result.ok) refreshQuoteSurfaces();
  return result;
}

export async function deactivateQuoteRevisionAction(id: string, confirm: boolean) {
  const result = await deactivateQuoteRevision(id, confirm);
  if (result.ok) refreshQuoteSurfaces();
  return result;
}

export async function previewQuoteDraftAction(input: {
  draft: unknown;
  answers: unknown;
}) {
  await requireAdmin();
  const result = previewDraftCalculation(input?.draft, input?.answers);
  if (!result.ok) return result;
  return {
    ok: true as const,
    basePrice: result.price.basePrice,
    finalPrice: result.price.finalPrice,
    lines: result.price.deductionBreakdown.map((line) => ({
      reason: line.reason,
      amount: line.amount,
    })),
  };
}
