import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Search } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { CATEGORIES, CATEGORY_MAP } from "@/config/categories";
import { PRODUCTS, displaySku, searchProducts } from "@/lib/catalog";
import { useOverlays } from "@/components/providers/OverlayProvider";
import { BrandImage } from "@/components/common/BrandImage";

export default function SearchCommand({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const navigate = useNavigate();
  const { openQuickView } = useOverlays();

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q), 150);
    return () => clearTimeout(t);
  }, [q]);

  const allMatches = useMemo(
    () => (debounced.trim() ? searchProducts(PRODUCTS, debounced) : []),
    [debounced],
  );

  // Show top 6 results in the popup, directing users to view all for complete listings
  const results = useMemo(() => allMatches.slice(0, 6), [allMatches]);

  const cats = useMemo(() => {
    const t = debounced.toLowerCase().trim();
    return t
      ? CATEGORIES.filter((c) => c.name.toLowerCase().includes(t)).slice(0, 4)
      : CATEGORIES.slice(0, 6);
  }, [debounced]);

  const goAll = () => {
    onOpenChange(false);
    navigate({ to: "/products", search: { q: q.trim() || undefined } });
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-charcoal/45 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed inset-x-0 top-0 z-50 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-b-2xl sm:rounded-b-3xl bg-card shadow-lift outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-top-4 md:left-1/2 md:top-[8vh] md:max-h-[82vh] md:w-[680px] md:-translate-x-1/2 md:rounded-3xl">
          <DialogPrimitive.Title className="sr-only">Search products</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Search by product name, SKU, category or material.
          </DialogPrimitive.Description>

          {/* Sticky Search Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              goAll();
            }}
            className="flex shrink-0 items-center gap-3 border-b border-border bg-card px-5"
          >
            <Search className="size-5 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search gift sets, bags, bottles, SKU…"
              className="h-16 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
              aria-label="Search products"
            />
            <DialogPrimitive.Close className="text-sm font-medium text-muted-foreground hover:text-olive cursor-pointer">
              Close
            </DialogPrimitive.Close>
          </form>

          {/* Middle: Scrollable Results (Constant Width, No Bleeding) */}
          <div className="flex-1 overflow-y-auto min-h-0 p-3">
            {results.length > 0 && (
              <div>
                {/* Result count & view all hint */}
                <div className="mb-2 flex items-center justify-between px-2 text-xs text-muted-foreground">
                  <span>
                    Showing {results.length} of {allMatches.length} matching products
                  </span>
                  {allMatches.length > results.length && (
                    <button
                      type="button"
                      onClick={goAll}
                      className="font-semibold text-olive hover:underline cursor-pointer"
                    >
                      View all {allMatches.length} results →
                    </button>
                  )}
                </div>

                <ul className="space-y-1">
                  {results.map((p) => (
                    <li key={p.sku}>
                      <button
                        type="button"
                        onClick={() => {
                          onOpenChange(false);
                          openQuickView(p.sku);
                        }}
                        className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-muted focus-visible:bg-muted transition-colors cursor-pointer"
                      >
                        <BrandImage
                          src={p.images[0]}
                          alt=""
                          className="size-12 shrink-0 rounded-lg bg-stage-ivory object-contain p-1"
                          loading="lazy"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-olive">
                            {p.name}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {CATEGORY_MAP[p.category]?.name} · {displaySku(p.sku)}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {debounced && results.length === 0 && (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                No products match &quot;{debounced}&quot;. Try exploring a category below.
              </p>
            )}

            {!debounced && (
              <div className="px-3 py-2">
                <p className="pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Popular searches
                </p>
                <ul className="flex flex-wrap gap-2">
                  {[
                    "Gift sets",
                    "Laptop bags",
                    "Bottles",
                    "Welcome kits",
                    "Jute bags",
                    "Diaries",
                  ].map((term) => (
                    <li key={term}>
                      <button
                        type="button"
                        onClick={() => setQ(term)}
                        className="rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-slate transition-colors hover:border-olive hover:bg-muted hover:text-olive cursor-pointer"
                      >
                        {term}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sticky Bottom Section: Categories & See All Results CTA */}
          <div className="shrink-0 border-t border-border bg-card/98 backdrop-blur-sm p-3 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
            <p className="px-1 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Browse Categories
            </p>
            <ul className="grid grid-cols-2 gap-1 sm:grid-cols-3">
              {cats.map((c) => (
                <li key={c.slug}>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenChange(false);
                      navigate({ to: "/categories/$slug", params: { slug: c.slug } });
                    }}
                    className="w-full truncate rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-slate hover:bg-muted hover:text-olive transition-colors cursor-pointer"
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>

            {q.trim() && (
              <button
                type="button"
                onClick={goAll}
                className="mt-2.5 flex w-full items-center justify-between rounded-xl bg-olive px-4 py-3 text-sm font-semibold text-white hover:bg-olive/90 transition-colors cursor-pointer shadow-2xs"
              >
                <span>
                  See all {allMatches.length > 0 ? allMatches.length : ""} results for &quot;
                  {q.trim()}&quot;
                </span>
                <ArrowRight className="size-4 text-gold" />
              </button>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
