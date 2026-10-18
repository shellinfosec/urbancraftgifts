import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Boxes,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Send,
  Building2,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { CATEGORY_GROUPS, categoriesInGroup, type CategoryGroupId } from "@/config/categories";
import { pickFrom } from "@/lib/catalog";
import { useOverlays } from "@/components/providers/OverlayProvider";
import { STAGE_TONE } from "@/components/product/ProductImageStage";
import { cn } from "@/lib/utils";
import { BrandImage } from "@/components/common/BrandImage";

const GROUP_ICON: Record<CategoryGroupId, typeof Boxes> = {
  "gift-sets": Boxes,
  bags: Briefcase,
  eco: Leaf,
  office: Building2,
};

const VISIBLE_COUNT = 4;

/** Two-pane mega menu: group rail on the left, visual category tiles on the right. */
export function MegaMenu({ open, onNavigate }: { open: boolean; onNavigate: () => void }) {
  const [group, setGroup] = useState<CategoryGroupId>("gift-sets");
  const [index, setIndex] = useState(0);
  const { openInquiry } = useOverlays();

  const cats = categoriesInGroup(group);
  const meta = CATEGORY_GROUPS.find((g) => g.id === group);

  const maxIndex = Math.max(0, cats.length - VISIBLE_COUNT);
  const safeIndex = Math.min(index, maxIndex);

  const handleGroupChange = (newGroup: CategoryGroupId) => {
    if (newGroup !== group) {
      setGroup(newGroup);
      setIndex(0);
    }
  };

  useEffect(() => {
    if (!open) {
      setIndex(0);
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-x-0 top-full hidden border-b border-border bg-card shadow-lift lg:block"
        >
          <div className="container-site grid grid-cols-[260px_1fr] gap-8 py-7">
            <div className="flex flex-col border-r border-border pr-6">
              <p className="eyebrow mb-3 text-muted-foreground">Browse by type</p>
              <ul role="tablist" aria-orientation="vertical" className="space-y-1">
                {CATEGORY_GROUPS.map((g) => {
                  const Icon = GROUP_ICON[g.id];
                  const active = g.id === group;
                  return (
                    <li key={g.id}>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onMouseEnter={() => handleGroupChange(g.id)}
                        onFocus={() => handleGroupChange(g.id)}
                        onClick={() => handleGroupChange(g.id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition",
                          active
                            ? "bg-olive text-primary-foreground"
                            : "text-charcoal hover:bg-muted",
                        )}
                      >
                        <Icon className="size-[18px] shrink-0" strokeWidth={1.6} />
                        <span className="flex-1 text-sm font-semibold">{g.label}</span>
                        <ChevronRight className="size-4 opacity-60" />
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-auto space-y-2 pt-6">
                <Link
                  to="/categories"
                  onClick={onNavigate}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-olive hover:bg-muted"
                >
                  All categories <ArrowRight className="size-4" />
                </Link>
                <Link
                  to="/products"
                  onClick={onNavigate}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-olive hover:bg-muted"
                >
                  All products <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>

            <div
              role="tabpanel"
              aria-label={meta?.label}
              onKeyDown={(e) => {
                if (maxIndex <= 0) return;
                if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
                if (e.key === "ArrowRight") setIndex((i) => Math.min(maxIndex, i + 1));
              }}
            >
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="font-display text-xl text-olive">{meta?.label}</p>
                  <p className="text-sm text-muted-foreground">{meta?.blurb}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate();
                    openInquiry({ categories: cats.map((c) => c.slug) });
                  }}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-brown hover:underline underline-offset-4"
                >
                  <Send className="size-3.5" /> Get help choosing
                </button>
              </div>

              <div className="w-full overflow-hidden">
                <div
                  className="flex gap-3 transition-transform duration-300 ease-out"
                  style={{
                    transform: `translateX(calc(-${safeIndex} * ((100% + 12px) / ${VISIBLE_COUNT})))`,
                  }}
                >
                  {cats.map((c) => {
                    const img = pickFrom(c.slug, 1)[0];
                    return (
                      <div key={c.slug} className="w-[calc((100%-36px)/4)] shrink-0">
                        <Link
                          to="/categories/$slug"
                          params={{ slug: c.slug }}
                          onClick={onNavigate}
                          className={cn(
                            "group flex h-full flex-col overflow-hidden rounded-2xl border border-border transition hover:border-olive/40 hover:shadow-soft",
                            STAGE_TONE[c.tone],
                          )}
                        >
                          <span className="relative block aspect-[4/3]">
                            {img && (
                              <BrandImage
                                src={img.images[0]}
                                alt=""
                                loading="lazy"
                                className="absolute inset-0 h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-[1.04]"
                              />
                            )}
                          </span>
                          <span className="block bg-card px-3 py-2.5">
                            <span className="text-sm font-semibold text-olive">{c.shortName}</span>
                          </span>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>

              {cats.length > VISIBLE_COUNT && (
                <div className="mt-3.5 flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
                  <span className="font-medium tabular-nums">
                    Showing {safeIndex + 1}–{safeIndex + VISIBLE_COUNT} of {cats.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIndex((i) => Math.max(0, i - 1))}
                      disabled={safeIndex === 0}
                      aria-label="Previous category"
                      className={cn(
                        "inline-flex size-8 items-center justify-center rounded-full border transition",
                        safeIndex === 0
                          ? "cursor-not-allowed border-border/40 bg-muted/40 text-muted-foreground/30 opacity-40"
                          : "border-border bg-card text-olive shadow-2xs hover:bg-muted hover:text-olive-deep",
                      )}
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <div className="flex items-center gap-1 px-1">
                      {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setIndex(i)}
                          aria-label={`Slide to position ${i + 1}`}
                          className={cn(
                            "h-1.5 rounded-full transition-all duration-300",
                            i === safeIndex ? "w-4 bg-olive" : "w-1.5 bg-border hover:bg-olive/40",
                          )}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIndex((i) => Math.min(maxIndex, i + 1))}
                      disabled={safeIndex >= maxIndex}
                      aria-label="Next category"
                      className={cn(
                        "inline-flex size-8 items-center justify-center rounded-full border transition",
                        safeIndex >= maxIndex
                          ? "cursor-not-allowed border-border/40 bg-muted/40 text-muted-foreground/30 opacity-40"
                          : "border-border bg-card text-olive shadow-2xs hover:bg-muted hover:text-olive-deep",
                      )}
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
