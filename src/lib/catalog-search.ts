import type { SortKey } from "@/lib/catalog";

export interface CatalogSearch {
  q?: string | undefined;
  cat?: string[] | undefined;
  color?: string[] | undefined;
  custom?: string[] | undefined;
  sort?: SortKey | undefined;
  page?: number | undefined;
  perPage?: number | undefined;
  p?: string | undefined;
}

const SORTS: SortKey[] = ["featured", "name-asc", "name-desc", "category"];
const ALLOWED_PER_PAGE = [12, 24, 48, 96];

const arr = (v: unknown): string[] | undefined => {
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string").slice(0, 20);
  if (typeof v === "string" && v) return [v];
  return undefined;
};

/** Validates catalogue URL state so filters/pages are shareable and back-button safe. */
export function validateCatalogSearch(s: Record<string, unknown>): CatalogSearch {
  const page = Number(s["page"]);
  const perPage = Number(s["perPage"]);
  return {
    q: typeof s["q"] === "string" && s["q"] ? s["q"].slice(0, 80) : undefined,
    cat: arr(s["cat"]),
    color: arr(s["color"]),
    custom: arr(s["custom"]),
    sort:
      SORTS.includes(s["sort"] as SortKey) && s["sort"] !== "featured"
        ? (s["sort"] as SortKey)
        : undefined,
    page: Number.isInteger(page) && page > 1 ? page : undefined,
    perPage: ALLOWED_PER_PAGE.includes(perPage) && perPage !== 24 ? perPage : undefined,
    p: typeof s["p"] === "string" && s["p"] ? s["p"] : undefined,
  };
}
