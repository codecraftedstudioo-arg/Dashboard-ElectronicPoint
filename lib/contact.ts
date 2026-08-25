/** Public contact configuration — change WhatsApp here only. */
export const PUBLIC_CONTACT = {
  brandName: "Electronic Point",
  whatsappNumber:
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") ||
    "5491112345678",
  whatsappDisplay: "+54 9 11 1234-5678",
} as const;

export function buildWhatsAppUrl(message: string): string {
  const text = encodeURIComponent(message);
  return `https://wa.me/${PUBLIC_CONTACT.whatsappNumber}?text=${text}`;
}

export function catalogInquiryMessage(product: {
  name: string;
  storage: string;
  salePrice: number;
}): string {
  const price = Math.round(product.salePrice);
  return `Hola! Quería consultar por el ${product.name} ${product.storage} de $${price} USD que vi en ${PUBLIC_CONTACT.brandName}.`;
}

export function generalInquiryMessage(): string {
  return `Hola! Quería consultar por los iPhones usados de ${PUBLIC_CONTACT.brandName}.`;
}
