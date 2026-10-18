import type { InquiryData } from "@/lib/inquiry-service";
import type { InquiryPrefill } from "@/components/providers/OverlayProvider";

/** A product CTA defines this quote's shortlist; retain only the draft's other details. */
export function applyInquiryContext(draft: InquiryData, prefill: InquiryPrefill): InquiryData {
  return {
    ...draft,
    products: prefill.products?.length ? Array.from(new Set(prefill.products)) : draft.products,
    categories: prefill.categories?.length
      ? Array.from(new Set(prefill.categories))
      : prefill.products?.length
        ? []
        : draft.categories,
    intent: prefill.intent || draft.intent,
  };
}
