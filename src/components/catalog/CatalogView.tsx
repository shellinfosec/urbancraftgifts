import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, FileText, Search, SlidersHorizontal, X } from "lucide-react";
import { CATEGORIES, CATEGORY_MAP } from "@/config/categories";
import { SORT_OPTIONS, facetCounts, queryCatalog, type Product, type SortKey } from "@/lib/catalog";
import { ProductGrid } from "@/components/product/ProductCard";
import { EmptyState } from "@/components/common/PageParts";
import { useOverlays } from "@/components/providers/OverlayProvider";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CatalogSearch } from "@/lib/catalog-search";
import { cn } from "@/lib/utils";

const DEFAULT_PAGE_SIZE = 24;

interface Props {
  base: Product[];
  search: CatalogSearch;
  /** Hide category facet on single-category pages. */
  showCategoryFacet?: boolean;
}

function toggle(list: string[] | undefined, v: string) {
  const s = new Set(list ?? []);
  if (s.has(v)) s.delete(v);
  else s.add(v);
  return s.size ? Array.from(s) : undefined;
}

export function CatalogView({ base, search, showCategoryFacet = false }: Props) {
  const navigate = useNavigate();
  const { openQuickView } = useOverlays();
  const [drawer, setDrawer] = useState(false);
  const [q, setQ] = useState(search.q ?? "");
  const headingRef = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  const update = (patch: Partial<CatalogSearch>, resetPage = true) =>
    navigate({
      to: ".",
      search: (prev: CatalogSearch) => ({
        ...prev,
        ...patch,
        ...(resetPage ? { page: undefined } : {}),
      }),
      replace: resetPage,
      resetScroll: false,
    });

  // Debounced search into URL
  useEffect(() => {
    const t = setTimeout(() => {
      if ((search.q ?? "") !== q) update({ q: q.trim() || undefined });
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);
  useEffect(() => setQ(search.q ?? ""), [search.q]);

  // Deep-link quick view (?p=sku)
  useEffect(() => {
    if (search.p) openQuickView(search.p);
  }, [search.p, openQuickView]);

  const pageSize = search.perPage ?? DEFAULT_PAGE_SIZE;
  const results = useMemo(() => queryCatalog(base, search), [base, search]);
  const facets = useMemo(() => facetCounts(base), [base]);
  const pages = Math.max(1, Math.ceil(results.length / pageSize));
  const page = Math.min(Math.max(1, search.page ?? 1), pages);
  const visible = results.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    headingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [page, pageSize]);

  const chips = [
    ...(search.cat ?? []).map((v) => ({
      key: "cat" as const,
      v,
      label: CATEGORY_MAP[v]?.shortName ?? v,
    })),
    ...(search.color ?? []).map((v) => ({ key: "color" as const, v, label: v })),
    ...(search.custom ?? []).map((v) => ({ key: "custom" as const, v, label: v })),
  ];
  const clearAll = () => {
    setQ("");
    update({ cat: undefined, color: undefined, custom: undefined, q: undefined });
  };

  const Filters = (
    <div className="space-y-7">
      {showCategoryFacet && (
        <FacetGroup title="Category">
          {CATEGORIES.map((c) => (
            <FacetCheck
              key={c.slug}
              label={c.name}
              count={facets.cat.get(c.slug) ?? 0}
              checked={!!search.cat?.includes(c.slug)}
              onChange={() => update({ cat: toggle(search.cat, c.slug) })}
            />
          ))}
        </FacetGroup>
      )}
      <FacetGroup title="Colour family">
        {Array.from(facets.color.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([k, n]) => (
            <FacetCheck
              key={k}
              label={k}
              count={n}
              checked={!!search.color?.includes(k)}
              onChange={() => update({ color: toggle(search.color, k) })}
            />
          ))}
      </FacetGroup>
      <FacetGroup title="Branding method">
        {Array.from(facets.custom.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([k, n]) => (
            <FacetCheck
              key={k}
              label={k}
              count={n}
              checked={!!search.custom?.includes(k)}
              onChange={() => update({ custom: toggle(search.custom, k) })}
            />
          ))}
      </FacetGroup>
    </div>
  );

  return (
    <div className="container-site pb-10">
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-[calc(var(--header-h)+1rem)] max-h-[calc(100dvh-var(--header-h)-2rem)] overflow-y-auto pr-2">
            {Filters}
          </div>
        </aside>

        <div className="min-w-0">
          <div
            ref={headingRef}
            className="scroll-mt-[calc(var(--header-h)+1rem)] flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <label className="relative flex-1">
              <span className="sr-only">Search within results</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name, SKU or material"
                className="h-11 w-full rounded-xl border border-input bg-card pl-10 pr-3 text-sm outline-none focus:border-brown"
              />
            </label>
            <div className="flex gap-2">
              <Button
                asChild
                variant="outline"
                className="hidden sm:inline-flex h-11 items-center gap-1.5 rounded-xl border-gold/40 bg-gold/10 hover:bg-gold/20 text-olive text-xs font-semibold px-3.5"
              >
                <Link to="/catalogue">
                  <FileText className="size-4 text-gold" />
                  <span>Catalogue (PDF)</span>
                </Link>
              </Button>
              <Button variant="outline" className="lg:hidden" onClick={() => setDrawer(true)}>
                <SlidersHorizontal /> Filters{chips.length ? ` (${chips.length})` : ""}
              </Button>
              <Select
                value={search.sort ?? "featured"}
                onValueChange={(v) =>
                  update({ sort: v === "featured" ? undefined : (v as SortKey) })
                }
              >
                <SelectTrigger
                  className="h-11 w-[170px] rounded-xl bg-card"
                  aria-label="Sort products"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <p className="mr-2 font-medium text-muted-foreground" aria-live="polite">
                {results.length} {results.length === 1 ? "product" : "products"}
              </p>
              {chips.map((c) => (
                <button
                  key={`${c.key}-${c.v}`}
                  type="button"
                  onClick={() => update({ [c.key]: toggle(search[c.key], c.v) })}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full bg-olive/10 px-3 text-xs font-medium text-olive hover:bg-olive/15"
                  aria-label={`Remove filter ${c.label}`}
                >
                  {c.label} <X className="size-3" />
                </button>
              ))}
              {(chips.length > 0 || search.q) && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs font-semibold text-brown underline underline-offset-4"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                Items per page:
              </span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  const num = Number(v);
                  update({ perPage: num === DEFAULT_PAGE_SIZE ? undefined : num, page: undefined });
                }}
              >
                <SelectTrigger
                  className="h-8 w-[108px] rounded-lg bg-card text-xs"
                  aria-label="Items per page"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[12, 24, 48, 96].map((n) => (
                    <SelectItem key={n} value={String(n)} className="text-xs">
                      {n} per page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6">
            {visible.length ? (
              <ProductGrid products={visible} />
            ) : (
              <EmptyState
                title="No products match these filters"
                body="Try removing a filter or searching for something broader - for example 'bottle', 'leather' or 'gift set'."
                action={<Button onClick={clearAll}>Clear filters</Button>}
              />
            )}
          </div>

          {pages > 1 && (
            <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-1.5">
              <PageBtn
                disabled={page === 1}
                onClick={() => update({ page: page - 1 }, false)}
                label="Previous page"
              >
                <ChevronLeft className="size-4" />
              </PageBtn>
              {Array.from({ length: pages }, (_, i) => i + 1)
                .filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1)
                .map((n, i, arr) => (
                  <span key={n} className="flex items-center gap-1.5">
                    {i > 0 && n - (arr[i - 1] ?? n) > 1 && (
                      <span className="px-1 text-muted-foreground">…</span>
                    )}
                    <PageBtn
                      active={n === page}
                      onClick={() => update({ page: n === 1 ? undefined : n }, false)}
                      label={`Page ${n}`}
                    >
                      {n}
                    </PageBtn>
                  </span>
                ))}
              <PageBtn
                disabled={page === pages}
                onClick={() => update({ page: page + 1 }, false)}
                label="Next page"
              >
                <ChevronRight className="size-4" />
              </PageBtn>
            </nav>
          )}
        </div>
      </div>

      <Sheet open={drawer} onOpenChange={setDrawer}>
        <SheetContent
          side="bottom"
          className="flex max-h-[88dvh] flex-col rounded-t-3xl bg-background p-0"
        >
          <div className="border-b border-border px-5 py-4">
            <SheetTitle className="font-display text-lg text-olive">Filters</SheetTitle>
            <SheetDescription className="sr-only">Narrow the product list</SheetDescription>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5">{Filters}</div>
          <div className="flex gap-2 border-t border-border p-4 pb-safe">
            <Button variant="outline" className="flex-1" onClick={clearAll}>
              Clear
            </Button>
            <Button className="flex-1" onClick={() => setDrawer(false)}>
              Show {results.length} products
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function FacetGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-3 text-xs font-semibold uppercase tracking-wider text-olive">
        {title}
      </legend>
      <div className="space-y-1">{children}</div>
    </fieldset>
  );
}

function FacetCheck({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-lg px-1 text-sm hover:bg-muted">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-4 accent-[var(--olive)]"
      />
      <span className="flex-1">{label}</span>
      <span className="text-xs text-muted-foreground">{count}</span>
    </label>
  );
}

function PageBtn({
  children,
  active,
  disabled,
  onClick,
  label,
}: {
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? "page" : undefined}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-11 min-w-11 items-center justify-center rounded-xl border text-sm font-medium transition disabled:opacity-40",
        active
          ? "border-olive bg-olive text-primary-foreground"
          : "border-border bg-card hover:border-olive/50",
      )}
    >
      {children}
    </button>
  );
}
