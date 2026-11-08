import { createFileRoute } from "@tanstack/react-router";
import { BUSINESS } from "@/config/business";
import { CATEGORIES } from "@/config/categories";

const STATIC = [
  "/",
  "/catalogue",
  "/products",
  "/about",
  "/services",
  "/contact",
  "/testimonials",
  "/faqs",
  "/terms",
  "/privacy-policy",
  "/shipping-policy",
  "/cancellation-returns",
  "/cookie-policy",
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () => {
        const urls = [...STATIC, ...CATEGORIES.map((c) => `/categories/${c.slug}`)];
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${BUSINESS.siteUrl}${u}</loc></url>`).join("\n")}\n</urlset>`;
        return new Response(xml, { headers: { "Content-Type": "application/xml" } });
      },
    },
  },
});
