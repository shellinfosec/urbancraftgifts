import { describe, it, expect } from "vitest";
import { PRODUCTS, productImageUrl } from "@/lib/catalog";
import { CATEGORIES } from "@/config/categories";
import { LOGO_ASSETS, HEADER_LOGO_ASSETS, FAVICONS } from "@/config/brand";

describe("local assets verification", () => {
  it("resolves product images to local paths without remote host", () => {
    expect(PRODUCTS.length).toBe(327);
    for (const product of PRODUCTS) {
      for (const img of product.images) {
        expect(img).not.toContain("https://urbancraftgifts.com");
        expect(img).toContain("src/assets/media/product-images");
      }
    }
  });

  it("resolves category banners to local paths", () => {
    expect(CATEGORIES.length).toBe(16);
    for (const cat of CATEGORIES) {
      expect(cat.banner).not.toContain("https://urbancraftgifts.com");
      expect(cat.banner).toContain("src/assets/media/banners");
    }
  });

  it("resolves logo assets to local paths", () => {
    expect(HEADER_LOGO_ASSETS.icon).not.toContain("https://urbancraftgifts.com");
    expect(HEADER_LOGO_ASSETS.icon).toContain("src/assets/media/brand-media");
    expect(HEADER_LOGO_ASSETS.wordmark).not.toContain("https://urbancraftgifts.com");
    expect(HEADER_LOGO_ASSETS.wordmark).toContain("src/assets/media/brand-media");

    for (const [key, logo] of Object.entries(LOGO_ASSETS)) {
      expect(logo.src).not.toContain("https://urbancraftgifts.com");
      expect(logo.src).toContain("src/assets/media/brand-media");
    }

    for (const [key, icon] of Object.entries(FAVICONS)) {
      expect(icon).not.toContain("https://urbancraftgifts.com");
      expect(icon).toContain("src/assets/media/brand-media");
    }
  });
});
