import raw from "@/data/products.json";
import { CATEGORIES, CATEGORY_MAP } from "@/config/categories";

const productImagesRecord = import.meta.glob<string>(
  "/src/assets/media/product-images/**/*.{png,jpg,jpeg,webp,svg}",
  { eager: true, import: "default" },
);

const PRODUCT_IMAGE_MAP = new Map<string, string>();
for (const [key, value] of Object.entries(productImagesRecord)) {
  const normalized = key.replace(/.*\/product-images\//, "");
  PRODUCT_IMAGE_MAP.set(normalized, value);
}

export interface Product {
  sku: string;
  category: string;
  name: string;
  summary: string;
  color: string;
  materials: string[];
  customization: string[];
  useCases: string[];
  occasions: string[];
  tags: string[];
  alt: string;
  images: string[];
}

interface RawProduct extends Omit<Product, "images"> {
  images: string[];
}

export const productImageUrl = (path: string) => {
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  const cleanPath = path.replace(/^\/+/, "");
  return PRODUCT_IMAGE_MAP.get(cleanPath) || cleanPath;
};

const categoryOrder = new Map(CATEGORIES.map((c, i) => [c.slug, i]));

/** Curated default order: category order, then source order. */
export const PRODUCTS: Product[] = (raw as RawProduct[])
  .map((p) => ({ ...p, images: p.images.map(productImageUrl) }))
  .sort((a, b) => (categoryOrder.get(a.category) ?? 99) - (categoryOrder.get(b.category) ?? 99));

export const PRODUCT_MAP = new Map(PRODUCTS.map((p) => [p.sku, p]));
export const getProduct = (sku: string) => PRODUCT_MAP.get(sku);

export const displaySku = (sku: string) => sku.toUpperCase();

export const productsInCategory = (slug: string) => PRODUCTS.filter((p) => p.category === slug);

export const categoryCount = (slug: string) => productsInCategory(slug).length;

/** Collapse noisy colour labels into a small, reliable facet set. */
export function colorFamily(c: string): string {
  const s = c.toLowerCase();
  if (/black|charcoal/.test(s)) return "Black & Charcoal";
  if (/white|silver|grey|gray/.test(s)) return "White & Grey";
  if (/brown|tan|camel|coffee|chocolate/.test(s)) return "Brown & Tan";
  if (/beige|cream|natural|jute|ivory|khaki/.test(s)) return "Natural & Beige";
  if (/blue|navy/.test(s)) return "Blue";
  if (/green|olive/.test(s)) return "Green";
  if (/red|maroon|burgundy|orange|pink|rose/.test(s)) return "Red & Warm";
  return "Other";
}

/** Best-effort swatch hex for a product's colour label; null when unknown. */
export function colorSwatch(c: string): string | null {
  const s = c.toLowerCase();
  const map: [RegExp, string][] = [
    [/black|charcoal/, "#2B2828"],
    [/white|ivory|cream/, "#F4F1E6"],
    [/grey|gray|silver/, "#A7A7A7"],
    [/brown|coffee|chocolate/, "#6B4226"],
    [/tan|camel/, "#C19A6B"],
    [/beige|natural|jute|khaki/, "#D9C9A3"],
    [/navy/, "#1F2A44"],
    [/blue/, "#3B5B8C"],
    [/olive/, "#2F3A2E"],
    [/green/, "#4C6B4F"],
    [/maroon|burgundy/, "#6E2A33"],
    [/red/, "#A63A3A"],
    [/orange|terracotta/, "#C9684A"],
    [/pink|rose/, "#D9A7A1"],
    [/gold/, "#D4B483"],
    [/yellow/, "#D9B84A"],
    [/purple|violet/, "#6B4E71"],
  ];
  for (const [re, hex] of map) if (re.test(s)) return hex;
  return null;
}

export const CUSTOMIZATION_FACETS = [
  "Laser Engraving",
  "Screen Printing",
  "UV Print",
  "Debossing",
  "Embossing",
  "Embroidery",
];

export type SortKey = "featured" | "name-asc" | "name-desc" | "category";
export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Recommended" },
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
  { value: "category", label: "Category" },
];

export interface CatalogQuery {
  q?: string | undefined;
  cat?: string[] | undefined;
  color?: string[] | undefined;
  custom?: string[] | undefined;
  sort?: SortKey | undefined;
}

const haystack = new Map(
  PRODUCTS.map((p) => [
    p.sku,
    [
      p.name,
      p.sku,
      CATEGORY_MAP[p.category]?.name ?? "",
      p.tags.join(" "),
      p.materials.join(" "),
      p.useCases.join(" "),
      p.color,
    ]
      .join(" ")
      .toLowerCase(),
  ]),
);

export function searchProducts(list: Product[], q: string): Product[] {
  const terms = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return list;
  return list
    .map((p) => {
      const h = haystack.get(p.sku) ?? "";
      let score = 0;
      for (const t of terms) {
        if (!h.includes(t)) return null;
        score += p.name.toLowerCase().includes(t) ? 3 : 1;
        if (p.sku.includes(t)) score += 5;
      }
      return { p, score };
    })
    .filter((x): x is { p: Product; score: number } => x !== null)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);
}

export function queryCatalog(base: Product[], query: CatalogQuery): Product[] {
  let list = base;
  if (query.cat?.length) list = list.filter((p) => query.cat!.includes(p.category));
  if (query.color?.length) list = list.filter((p) => query.color!.includes(colorFamily(p.color)));
  if (query.custom?.length)
    list = list.filter((p) =>
      query.custom!.some((c) =>
        p.customization.some((m) => m.toLowerCase().includes(c.toLowerCase())),
      ),
    );
  if (query.q) list = searchProducts(list, query.q);
  const sort = query.sort ?? "featured";
  if (sort === "name-asc") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "name-desc") list = [...list].sort((a, b) => b.name.localeCompare(a.name));
  if (sort === "category")
    list = [...list].sort((a, b) =>
      (CATEGORY_MAP[a.category]?.name ?? "").localeCompare(CATEGORY_MAP[b.category]?.name ?? ""),
    );
  return list;
}

export function facetCounts(list: Product[]) {
  const color = new Map<string, number>();
  const custom = new Map<string, number>();
  const cat = new Map<string, number>();
  for (const p of list) {
    const f = colorFamily(p.color);
    color.set(f, (color.get(f) ?? 0) + 1);
    cat.set(p.category, (cat.get(p.category) ?? 0) + 1);
    for (const c of CUSTOMIZATION_FACETS)
      if (p.customization.some((m) => m.toLowerCase().includes(c.toLowerCase())))
        custom.set(c, (custom.get(c) ?? 0) + 1);
  }
  return { color, custom, cat };
}

/** Deterministic pick used for curated rails (stable between server and client). */
export function pickFrom(slug: string, n: number, offset = 0): Product[] {
  const list = productsInCategory(slug);
  return list.slice(offset, offset + n);
}
