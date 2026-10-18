import { describe, expect, it } from "vitest";
import { applyInquiryContext } from "@/lib/inquiry-context";
import type { InquiryData } from "@/lib/inquiry-service";

const draft: InquiryData = {
  intent: "",
  products: ["previous-product"],
  categories: ["backpacks"],
  quantity: "",
  date: "",
  customization: "unsure",
  location: "",
  name: "Alex",
  company: "",
  email: "",
  phone: "",
  notes: "",
};

describe("Product-specific quote context", () => {
  it("quotes only the product requested, not products from an earlier draft", () => {
    expect(applyInquiryContext(draft, { products: ["chosen-product"] }).products).toEqual([
      "chosen-product",
    ]);
  });
  it("keeps every selected favourite in the quote", () => {
    expect(applyInquiryContext(draft, { products: ["first", "second", "third"] }).products).toEqual(
      ["first", "second", "third"],
    );
  });
  it("preserves entered contact details when opening a product quote", () => {
    expect(applyInquiryContext(draft, { products: ["chosen-product"] }).name).toBe("Alex");
  });
});
