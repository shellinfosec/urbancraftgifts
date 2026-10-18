import { BUSINESS } from "@/config/business";
import { CATEGORY_MAP } from "@/config/categories";
import { displaySku, type Product } from "@/lib/catalog";

export type WhatsAppContext =
  | { kind: "general" }
  | { kind: "product"; product: Product; pageUrl?: string }
  | { kind: "category"; slug: string; pageUrl?: string }
  | { kind: "service"; service: string };

export function whatsappMessage(ctx: WhatsAppContext): string {
  const hi = `Hi ${BUSINESS.name},`;
  switch (ctx.kind) {
    case "product": {
      const cat = CATEGORY_MAP[ctx.product.category]?.name ?? "your catalogue";
      return `${hi} I'm interested in ${ctx.product.name} (SKU: ${displaySku(ctx.product.sku)}) from ${cat}. Please share customization and bulk-order details.${ctx.pageUrl ? `\n${ctx.pageUrl}` : ""}`;
    }
    case "category": {
      const cat = CATEGORY_MAP[ctx.slug]?.name ?? "your catalogue";
      return `${hi} I'm looking at your ${cat} and would like help choosing options for a corporate order.${ctx.pageUrl ? `\n${ctx.pageUrl}` : ""}`;
    }
    case "service":
      return `${hi} I'd like to discuss ${ctx.service.toLowerCase()} for our company. Could you guide me on options?`;
    default:
      return `${hi} I'd like to discuss a corporate gifting requirement.`;
  }
}

export function whatsappUrl(ctx: WhatsAppContext): string {
  return `https://wa.me/${BUSINESS.whatsappNumber}?text=${encodeURIComponent(whatsappMessage(ctx))}`;
}
