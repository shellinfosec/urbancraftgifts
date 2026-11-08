import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Printer,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  List,
  Sparkles,
  ShieldCheck,
  Truck,
  Award,
  Download,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import cataloguePdfUrl from "@/assets/Corporate Gifting Catalogue (Complete 2026 Collection) Urban Craft & Co.pdf?url";
import { CATEGORIES, type Category } from "@/config/categories";
import { BUSINESS } from "@/config/business";
import { Logo } from "@/components/brand/Logo";
import { WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import { pageHead } from "@/lib/seo";
import { PRODUCTS, type Product, displaySku } from "@/lib/catalog";
import { useOverlays } from "@/components/providers/OverlayProvider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/catalogue")({
  head: () =>
    pageHead({
      title: "Corporate Gifting Catalogue (Complete 2026 Collection · Printable A4 PDF)",
      description:
        "Official Corporate Gifting Catalogue by Urban Craft & Co. Explore all 327 premium boxed gift sets, executive bags, and onboarding kits with bespoke logo branding.",
      path: "/catalogue",
    }),
  component: CataloguePage,
});

/** Brand Theme definition for categories: alternates between deep forest olive and rich leather brown */
type BannerTheme = "olive" | "brown";

function getCategoryTheme(cat: Category, index: number): BannerTheme {
  if (cat.group === "gift-sets") {
    return index % 2 === 0 ? "olive" : "brown";
  }
  if (cat.group === "bags") {
    return cat.slug.includes("leather") || cat.slug.includes("duffle") ? "brown" : "olive";
  }
  if (cat.group === "eco") {
    return cat.slug.includes("jute") ? "brown" : "olive";
  }
  return cat.slug.includes("welcome") ? "olive" : "brown";
}

/**
 * Running header for every catalogue interior page.
 * Clean brand header with logo on left, direct studio contact on right.
 * No center category title clutter.
 */
function RunningPageHeader() {
  return (
    <div className="flex items-center justify-between border-b border-[#D8D2C5] pb-2 mb-2 text-xs w-full">
      <div className="flex items-center gap-2">
        <Logo variant="header" height={22} priority />
      </div>
      <div className="flex items-center gap-3 text-[11px] text-[#6E6557]">
        <span className="font-semibold text-olive">{BUSINESS.phoneDisplay}</span>
        <span className="hidden sm:inline">·</span>
        <span className="hidden sm:inline">{BUSINESS.email}</span>
      </div>
    </div>
  );
}

/** Running footer for every catalogue interior page */
function RunningPageFooter({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) {
  return (
    <div className="flex items-center justify-between border-t border-[#D8D2C5] pt-2 mt-2 text-[9.5px] text-[#7A7163] w-full">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-olive">{BUSINESS.name}</span>
        <span>—</span>
        <span>{BUSINESS.addressLine}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono text-[9px] font-semibold text-brown">
          urbancraftgifts.com · Pan-India Dispatch
        </span>
        <span className="rounded bg-[#EDE8DE] px-1.5 py-0.5 font-mono text-[8.5px] font-bold text-olive">
          Page {pageNumber} of {totalPages}
        </span>
      </div>
    </div>
  );
}

interface PageChunk {
  category: Category;
  theme: BannerTheme;
  isFirstPageOfCategory: boolean;
  pageIndexInCategory: number;
  products: Product[];
}

interface SpreadItem {
  id: string;
  type: "cover" | "spread" | "backCover";
  leftChunk?: PageChunk | undefined;
  leftIndex?: number | undefined;
  rightChunk?: PageChunk | undefined;
  rightIndex?: number | undefined;
  label: string;
}

export function CataloguePage() {
  const { openQuickView } = useOverlays();
  // Density toggle: 9 items per page (3 rows of 3) vs 12 items per page (4 rows of 3)
  const [density, setDensity] = useState<9 | 12>(9);
  const [viewMode, setViewMode] = useState<"book" | "scroll">("book");
  const [spreadMode, setSpreadMode] = useState<"double" | "single">("double");
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [activeSpreadIndex, setActiveSpreadIndex] = useState<number>(0);
  const [slideDirection, setSlideDirection] = useState<number>(1);
  const [isLocalhost, setIsLocalhost] = useState<boolean>(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      setIsLocalhost(
        import.meta.env.DEV ||
          host === "localhost" ||
          host === "127.0.0.1" ||
          host.endsWith(".local") ||
          host.startsWith("192.168.") ||
          host.startsWith("10.") ||
          host === "[::1]",
      );
    }
  }, []);

  // Group all products by category (all 16 categories, non-dynamic full lineup)
  const productsByCategory = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const cat of CATEGORIES) {
      const items = PRODUCTS.filter((p) => p.category === cat.slug);
      if (items.length > 0) {
        map.set(cat.slug, items);
      }
    }
    return map;
  }, []);

  // Split all 327 products into strictly sized pages based on selected density (9 or 12 per page)
  const pageChunks = useMemo<PageChunk[]>(() => {
    const chunks: PageChunk[] = [];
    CATEGORIES.forEach((cat, index) => {
      const catProducts = productsByCategory.get(cat.slug) ?? [];
      if (catProducts.length === 0) return;

      const theme = getCategoryTheme(cat, index);
      const chunkSize = density;

      for (let i = 0; i < catProducts.length; i += chunkSize) {
        chunks.push({
          category: cat,
          theme,
          isFirstPageOfCategory: i === 0,
          pageIndexInCategory: Math.floor(i / chunkSize),
          products: catProducts.slice(i, i + chunkSize),
        });
      }
    });
    return chunks;
  }, [productsByCategory, density]);

  // Total pages = Cover (1) + interior chunks + Back Cover (1)
  const totalPages = 1 + pageChunks.length + 1;

  // Group into Two-Page Spreads for luxury book mode
  const spreads = useMemo<SpreadItem[]>(() => {
    const list: SpreadItem[] = [
      {
        id: "cover",
        type: "cover",
        label: "Front Cover (Page 1)",
      },
    ];

    for (let i = 0; i < pageChunks.length; i += 2) {
      const left = pageChunks[i];
      if (!left) continue;
      const right = pageChunks[i + 1];
      const leftPageNum = i + 2;
      const rightPageNum = right ? i + 3 : null;

      list.push({
        id: `spread-${i}`,
        type: "spread",
        leftChunk: left,
        leftIndex: i,
        rightChunk: right,
        rightIndex: right ? i + 1 : undefined,
        label: right
          ? `Pages ${leftPageNum}–${rightPageNum} · ${left.category.shortName || left.category.name} & ${right.category.shortName || right.category.name}`
          : `Page ${leftPageNum} · ${left.category.shortName || left.category.name}`,
      });
    }

    list.push({
      id: "back-cover",
      type: "backCover",
      label: `Back Cover & Studio (Page ${totalPages})`,
    });

    return list;
  }, [pageChunks, totalPages]);

  // Safe navigation for 2-page spreads
  const goToSpread = useCallback(
    (index: number) => {
      const target = Math.max(0, Math.min(index, spreads.length - 1));
      setSlideDirection(target >= activeSpreadIndex ? 1 : -1);
      setActiveSpreadIndex(target);
    },
    [activeSpreadIndex, spreads.length],
  );

  const prevSpread = useCallback(
    () => goToSpread(activeSpreadIndex - 1),
    [goToSpread, activeSpreadIndex],
  );
  const nextSpread = useCallback(
    () => goToSpread(activeSpreadIndex + 1),
    [goToSpread, activeSpreadIndex],
  );

  // Safe navigation for 1-page view
  const goToPage = useCallback(
    (index: number) => {
      const target = Math.max(0, Math.min(index, totalPages - 1));
      setSlideDirection(target >= activePageIndex ? 1 : -1);
      setActivePageIndex(target);
    },
    [activePageIndex, totalPages],
  );

  const prevPage = useCallback(() => goToPage(activePageIndex - 1), [goToPage, activePageIndex]);
  const nextPage = useCallback(() => goToPage(activePageIndex + 1), [goToPage, activePageIndex]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStartX(e.touches[0]?.clientX ?? null);
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX === null) return;
      const touchEndX = e.changedTouches[0]?.clientX ?? 0;
      const diff = touchStartX - touchEndX;
      if (diff > 45) {
        nextPage();
      } else if (diff < -45) {
        prevPage();
      }
      setTouchStartX(null);
    },
    [touchStartX, nextPage, prevPage],
  );

  // Jump directly to a category's starting page/spread
  const jumpToCategory = useCallback(
    (categorySlug: string) => {
      const chunkIdx = pageChunks.findIndex((c) => c.category.slug === categorySlug);
      if (chunkIdx === -1) return;

      const pageTarget = chunkIdx + 1; // 0 is cover, so chunk 0 is page 1
      setActivePageIndex(pageTarget);

      // Find which spread contains this chunk
      const spreadIdx = spreads.findIndex(
        (s) => s.leftIndex === chunkIdx || s.rightIndex === chunkIdx,
      );
      if (spreadIdx !== -1) {
        setActiveSpreadIndex(spreadIdx);
      }

      // If in scroll mode, scroll to the section smoothly
      if (viewMode === "scroll") {
        const elem = document.getElementById(`cat-${categorySlug}-p0`);
        elem?.scrollIntoView({ behavior: "smooth" });
      }
    },
    [pageChunks, spreads, viewMode],
  );

  // Keyboard navigation for desktop book mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        if (spreadMode === "double") {
          prevSpread();
        } else {
          prevPage();
        }
      } else if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        if (spreadMode === "double") {
          nextSpread();
        } else {
          nextPage();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevSpread, nextSpread, prevPage, nextPage, spreadMode]);

  // Reset to cover on density change
  useEffect(() => {
    setActivePageIndex(0);
    setActiveSpreadIndex(0);
  }, [density]);

  const whatsappUrl = `https://wa.me/${BUSINESS.whatsappNumber}?text=${encodeURIComponent(
    "Hello Urban Craft & Co., I am reviewing your 2026 Corporate Catalogue and would like to enquire about bulk orders and bespoke logo branding.",
  )}`;

  // Active label for single page view
  const activeSinglePageLabel = useMemo(() => {
    if (activePageIndex === 0) return "Front Cover (Page 1)";
    if (activePageIndex === totalPages - 1) return `Back Cover & Studio (Page ${totalPages})`;
    const chunk = pageChunks[activePageIndex - 1];
    if (!chunk) return `Page ${activePageIndex + 1}`;
    return `${chunk.category.name}${chunk.pageIndexInCategory > 0 ? ` (Part ${chunk.pageIndexInCategory + 1})` : ""}`;
  }, [activePageIndex, totalPages, pageChunks]);

  // Render a product card with adaptive sizing for 9 vs 12 density
  const renderProductCard = (product: Product, isOlive: boolean) => {
    const isDensity12 = density === 12;

    return (
      <article
        key={product.sku}
        onClick={() => openQuickView(product.sku)}
        className={cn(
          "catalogue-card group flex flex-col justify-between rounded-xl border border-[#D8D2C5] bg-white shadow-2xs hover:border-olive/50 hover:shadow-xs transition-all cursor-pointer",
          isDensity12 ? "p-1 sm:p-1.5" : "p-1.5 sm:p-2",
        )}
      >
        <div>
          {/* Image Box */}
          <div
            className={cn(
              "catalogue-card-img relative aspect-[4/3] w-full overflow-hidden rounded-md border border-[#EDE8DE] bg-[#FAF8F5] p-1 flex items-center justify-center",
              isDensity12 ? "h-20 sm:h-24 md:h-28 lg:h-32" : "h-24 sm:h-32 md:h-38 lg:h-44",
            )}
          >
            <img
              src={product.images[0]}
              alt={product.name}
              loading="eager"
              decoding="sync"
              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {/* SKU & Color Pill */}
          <div className="mt-1 flex items-center justify-between gap-1">
            <span
              className={cn(
                "inline-block rounded px-1.5 py-0.5 font-mono font-bold tracking-wider",
                isDensity12 ? "text-[7.5px]" : "text-[8.5px]",
                isOlive ? "bg-[#1B2A1A] text-[#EADBBE]" : "bg-[#382012] text-[#F7EDE2]",
              )}
            >
              {displaySku(product.sku)}
            </span>
            {product.color && (
              <span
                className={cn(
                  "font-medium text-[#7A7163] truncate max-w-[85px]",
                  isDensity12 ? "text-[7.5px]" : "text-[8.5px]",
                )}
              >
                {product.color}
              </span>
            )}
          </div>

          {/* Product Title */}
          <h3
            className={cn(
              "mt-1 font-display font-semibold text-olive leading-tight line-clamp-2",
              isDensity12
                ? "text-[10px] sm:text-[10.5px] print:text-[7.2pt]"
                : "text-[11px] sm:text-xs print:text-[8.5pt]",
            )}
          >
            {product.name}
          </h3>
        </div>

        {/* Print Only Reference Bar */}
        <div className="print-only mt-1 pt-1 border-t border-[#EDE8DE] text-[7pt] text-[#8C8375] flex justify-between">
          <span>Urban Craft &amp; Co.</span>
          <span className="font-mono font-medium">{displaySku(product.sku)}</span>
        </div>
      </article>
    );
  };

  // Render Front Cover Page
  const renderFrontCover = (inSpread = false) => (
    <section
      className={cn(
        "catalogue-cover-front relative flex flex-col justify-between overflow-hidden bg-[#141E13] p-5 sm:p-10 md:p-14 text-center text-[#F4F1EA] shadow-xl min-h-[580px] sm:min-h-[760px] md:min-h-[920px] aspect-auto sm:aspect-[1/1.414] mx-auto print:mb-0 print:rounded-none print:shadow-none print:max-w-none print:min-h-[297mm] print:aspect-[210/297]",
        inSpread ? "w-full max-w-[700px] rounded-2xl" : "w-full max-w-[850px] rounded-2xl",
      )}
      aria-label="Catalogue Cover"
    >
      {/* Subtle Inset Gold Hairline Border */}
      <div className="pointer-events-none absolute inset-3 sm:inset-4 rounded-xl border border-gold/40 print:inset-3" />

      {/* Cover Top Header */}
      <div className="relative z-10 pt-2 sm:pt-4">
        <p className="eyebrow text-gold tracking-[0.25em] sm:tracking-[0.3em] text-[10px] sm:text-xs font-bold uppercase">
          {BUSINESS.name} · Established New Delhi
        </p>
      </div>

      {/* Cover Center: Grand Logo & Luxury Typography */}
      <div className="relative z-10 my-auto py-4 sm:py-8 space-y-4 sm:space-y-6">
        <div className="flex justify-center">
          <Logo
            variant="goldStacked"
            height={inSpread ? 190 : 220}
            className="w-auto max-h-[130px] sm:max-h-[180px] md:max-h-[220px] max-w-[260px] sm:max-w-[320px] drop-shadow-lg mx-auto"
            priority
          />
        </div>

        <div className="space-y-2 sm:space-y-3">
          <h1 className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white print:text-4xl leading-tight">
            Corporate Gifting Catalogue
          </h1>
          <p className="font-display italic text-base sm:text-2xl text-gold print:text-xl">
            2026 Collection &amp; Lookbook
          </p>
        </div>

        <div className="mx-auto h-[1.5px] w-20 sm:w-24 bg-gold/50" />

        <p className="mx-auto max-w-lg text-[11px] sm:text-xs md:text-sm text-[#D1CABF] leading-relaxed print:text-xs px-2">
          Complete 327-Item Lineup · Curated Gift Sets · Handcrafted Laptop Bags &amp; Backpacks ·
          Sustainable Jute &amp; Felt Carry · Executive Onboarding Kits
        </p>

        <div className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 sm:px-4 py-1 text-[9.5px] sm:text-[11px] font-semibold tracking-widest text-[#EADBBE] uppercase">
          <span>Bespoke Logo Branding</span>
          <span>·</span>
          <span>Pan-India Dispatch</span>
        </div>
      </div>

      {/* Cover Bottom: Studio & Contact Information */}
      <div className="relative z-10 border-t border-gold/30 pt-3 sm:pt-4 text-[10px] sm:text-xs text-[#B8B1A2] print:text-[10px]">
        <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-2.5 text-center sm:text-left">
          <div>
            <p className="font-semibold text-white">{BUSINESS.name}</p>
            <p>{BUSINESS.addressLine}</p>
          </div>
          <div className="text-center sm:text-right">
            <p>
              <strong>Tel:</strong> {BUSINESS.phoneDisplay}
            </p>
            <p>
              <strong>Email:</strong> {BUSINESS.email} · <strong>Web:</strong> {BUSINESS.siteUrl}
            </p>
          </div>
        </div>
      </div>
    </section>
  );

  // Render an Interior Page
  // A4 proportions with responsive mobile heights so incomplete rows never collapse
  const renderInteriorPage = (
    chunk: PageChunk,
    chunkIdx: number,
    spreadPosition?: "left" | "right",
  ) => {
    const pageNum = chunkIdx + 2;
    const isOlive = chunk.theme === "olive";
    const isDensity12 = density === 12;

    return (
      <section
        key={`${chunk.category.slug}-p${chunk.pageIndexInCategory}`}
        id={`cat-${chunk.category.slug}-p${chunk.pageIndexInCategory}`}
        className={cn(
          "catalogue-page scroll-mt-24 bg-white p-3.5 sm:p-6 md:p-7 border border-[#E3DDD1] print:mb-0 print:p-0 print:rounded-none print:border-none print:shadow-none print:max-w-none flex flex-col justify-between relative",
          "min-h-[520px] sm:min-h-[740px] md:min-h-[920px] aspect-auto sm:aspect-[1/1.414] w-full",
          spreadPosition === "left" &&
            "rounded-l-2xl border-r border-[#D8D2C5]/70 shadow-[-10px_10px_25px_rgba(0,0,0,0.06)]",
          spreadPosition === "right" &&
            "rounded-r-2xl border-l border-[#D8D2C5]/70 shadow-[10px_10px_25px_rgba(0,0,0,0.06)]",
          !spreadPosition && "rounded-2xl shadow-md max-w-[850px] mx-auto",
        )}
        aria-label={`${chunk.category.name} - Page ${chunk.pageIndexInCategory + 1}`}
      >
        {/* Subtle book spine shadow effect for 2-page spread */}
        {spreadPosition === "left" && (
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/[0.04] to-transparent print:hidden" />
        )}
        {spreadPosition === "right" && (
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/[0.04] to-transparent print:hidden" />
        )}

        {/* Running Header on every interior page (NO center clutter) */}
        <RunningPageHeader />

        {/* Page Content Body (Top-aligned content with content-start so sparse rows stay proportional) */}
        <div className="flex-1 flex flex-col justify-start gap-1.5 sm:gap-2.5 py-1">
          {/* Category Banner with Increased Filter Depth & Reduced Transparency */}
          {chunk.isFirstPageOfCategory ? (
            <div
              className={cn(
                "catalogue-banner w-full rounded-lg overflow-hidden shadow-xs relative flex items-center shrink-0 min-h-[52px] sm:min-h-[64px]",
                isDensity12 ? "mb-1 sm:mb-1.5" : "mb-1.5 sm:mb-2.5",
                isOlive
                  ? "bg-[#142013] border border-[#C4A468]/70 border-l-[4px] sm:border-l-[5px] border-l-[#C4A468]"
                  : "bg-[#2E190D] border border-[#D4A86A]/70 border-l-[4px] sm:border-l-[5px] border-l-[#D4A86A]",
              )}
            >
              {/* Banner Background Image with REDUCED TRANSPARENCY (65% opacity) & DEEP CONTRAST FILTERS */}
              <img
                src={chunk.category.banner}
                alt=""
                className="absolute inset-0 h-full w-full object-cover object-center opacity-65 contrast-125 saturate-125 brightness-90"
                loading="eager"
                decoding="sync"
              />

              {/* Deep filter gradient overlay for rich contrast & tonal depth */}
              <div
                className={cn(
                  "absolute inset-0",
                  isOlive
                    ? "bg-gradient-to-r from-[#121D11]/95 via-[#121D11]/80 to-[#121D11]/45"
                    : "bg-gradient-to-r from-[#29160B]/95 via-[#29160B]/80 to-[#29160B]/45",
                )}
              />

              {/* Content over banner with drop-shadows for crystalline clarity */}
              <div className="relative z-10 flex h-full w-full items-center justify-between px-3 sm:px-6 py-1.5 sm:py-2 gap-2">
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-[8px] sm:text-[9px] tracking-widest uppercase font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] truncate",
                        isOlive ? "text-gold" : "text-[#E8CEB5]",
                      )}
                    >
                      {chunk.category.group.replace("-", " ")} · 2026 Collection
                    </span>
                  </div>
                  <h2 className="font-display text-xs sm:text-base md:text-lg font-bold text-white print:text-[14px] leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] truncate">
                    {chunk.category.name}
                  </h2>
                  <p className="text-[9.5px] text-[#F0EAE1] line-clamp-1 max-w-md hidden md:block print:block drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
                    {chunk.category.intro}
                  </p>
                </div>

                {/* Category Count Pill with enhanced backdrop filter */}
                <div
                  className={cn(
                    "rounded-full px-2 sm:px-2.5 py-0.5 text-[8.5px] sm:text-[9.5px] font-bold border shrink-0 backdrop-blur-xs shadow-xs whitespace-nowrap",
                    isOlive
                      ? "bg-[#121D11]/75 text-[#FFF5E6] border-gold/75"
                      : "bg-[#29160B]/75 text-[#FFF7F0] border-[#E8CEB5]/75",
                  )}
                >
                  {productsByCategory.get(chunk.category.slug)?.length ?? 0} Selections
                </div>
              </div>
            </div>
          ) : (
            /* Continuation Strip on page 2+ of category to prevent giant whitespace */
            <div
              className={cn(
                "catalogue-banner-continuation w-full rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between shrink-0 shadow-2xs",
                isDensity12 ? "mb-1 sm:mb-1.5" : "mb-1.5 sm:mb-2",
                isOlive
                  ? "bg-[#142013] border border-[#C4A468]/60 text-[#F4F1EA]"
                  : "bg-[#2E190D] border border-[#D4A86A]/60 text-[#F4F1EA]",
              )}
            >
              <div className="flex items-center gap-2 truncate">
                <span
                  className={cn(
                    "text-[8.5px] sm:text-[9.5px] uppercase font-bold tracking-widest truncate",
                    isOlive ? "text-gold" : "text-[#E8CEB5]",
                  )}
                >
                  {chunk.category.name}
                </span>
                <span className="text-[9px] sm:text-[10px] text-[#A69F91] whitespace-nowrap">
                  · Part {chunk.pageIndexInCategory + 1}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[8.5px] sm:text-[9.5px] font-mono text-[#D1CABF]">
                  {productsByCategory.get(chunk.category.slug)?.length ?? 0} Total Selections
                </span>
              </div>
            </div>
          )}

          {/* Product Grid: Top-aligned (content-start) so pages with 1-2 rows do not stretch abnormally */}
          <div
            className={cn(
              "catalogue-grid-3 grid grid-cols-2 gap-2 sm:gap-2.5 sm:grid-cols-3 content-start print:content-start w-full",
              isDensity12 ? "print:gap-[2.2mm]" : "print:gap-[3.2mm]",
            )}
          >
            {chunk.products.map((product) => renderProductCard(product, isOlive))}
          </div>
        </div>

        {/* Running Footer on every interior page (pinned to bottom) */}
        <RunningPageFooter pageNumber={pageNum} totalPages={totalPages} />
      </section>
    );
  };

  // Render Back Cover Page
  const renderBackCover = (inSpread = false) => (
    <section
      className={cn(
        "catalogue-cover-back relative flex flex-col justify-between overflow-hidden bg-[#141E13] p-5 sm:p-10 md:p-14 text-center text-[#F4F1EA] shadow-xl min-h-[580px] sm:min-h-[760px] md:min-h-[920px] aspect-auto sm:aspect-[1/1.414] mx-auto print:mt-0 print:rounded-none print:shadow-none print:max-w-none print:min-h-[297mm] print:aspect-[210/297]",
        inSpread ? "w-full max-w-[700px] rounded-2xl" : "w-full max-w-[850px] rounded-2xl",
      )}
      aria-label="Catalogue Back Cover"
    >
      {/* Subtle Inset Gold Hairline Border */}
      <div className="pointer-events-none absolute inset-3 sm:inset-4 rounded-xl border border-gold/40 print:inset-3" />

      {/* Back Cover Top */}
      <div className="relative z-10 pt-2">
        <p className="eyebrow text-gold tracking-[0.25em] text-[10px] sm:text-[11px] font-bold uppercase">
          Urban Craft &amp; Co. · Bespoke Corporate Gifting
        </p>
      </div>

      {/* Back Cover Upper Section: Brand Crest & Headline */}
      <div className="relative z-10 pt-1 sm:pt-2 space-y-3 sm:space-y-4">
        <div className="flex justify-center">
          <Logo
            variant="goldStacked"
            height={inSpread ? 150 : 170}
            className="w-auto max-h-[110px] sm:max-h-[160px] max-w-[220px] sm:max-w-[250px] drop-shadow-md mx-auto"
            priority
          />
        </div>

        <div className="space-y-1 sm:space-y-1.5">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight print:text-3xl leading-tight">
            Gifts That Mean More
          </h2>
          <p className="mx-auto max-w-lg text-[11px] sm:text-xs md:text-sm text-[#D1CABF] leading-relaxed px-2">
            Elevate enterprise relationships with bespoke design, master craftsmanship, and seamless
            multi-city logistics.
          </p>
        </div>

        <div className="mx-auto h-[1.5px] w-16 sm:w-20 bg-gold/50" />
      </div>

      {/* Back Cover Middle: 4-Step Seamless Order Guide (Balanced Grid) */}
      <div className="relative z-10 my-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5 text-left max-w-xl mx-auto">
          <div className="rounded-xl border border-gold/30 bg-[#192718]/90 p-3 sm:p-4 space-y-1 shadow-xs">
            <span className="font-serif text-sm sm:text-base font-bold text-gold">01</span>
            <p className="text-xs sm:text-[13px] font-bold text-white tracking-wide">
              Curation &amp; Selection
            </p>
            <p className="text-[10.5px] sm:text-[11px] text-[#D1CABF] leading-relaxed">
              Choose from 320+ curated corporate sets or customize bespoke hampers tailored to your
              executive audience.
            </p>
          </div>

          <div className="rounded-xl border border-gold/30 bg-[#192718]/90 p-3 sm:p-4 space-y-1 shadow-xs">
            <span className="font-serif text-sm sm:text-base font-bold text-gold">02</span>
            <p className="text-xs sm:text-[13px] font-bold text-white tracking-wide">
              Free 3D Brand Mockup
            </p>
            <p className="text-[10.5px] sm:text-[11px] text-[#D1CABF] leading-relaxed">
              Share your vector logo for photorealistic digital visual mockups rendered and shared
              within 24 hours.
            </p>
          </div>

          <div className="rounded-xl border border-gold/30 bg-[#192718]/90 p-3 sm:p-4 space-y-1 shadow-xs">
            <span className="font-serif text-sm sm:text-base font-bold text-gold">03</span>
            <p className="text-xs sm:text-[13px] font-bold text-white tracking-wide">
              Pre-Production Sample
            </p>
            <p className="text-[10.5px] sm:text-[11px] text-[#D1CABF] leading-relaxed">
              Physical prototype review and approval for complete peace of mind before volume
              manufacturing begins.
            </p>
          </div>

          <div className="rounded-xl border border-gold/30 bg-[#192718]/90 p-3 sm:p-4 space-y-1 shadow-xs">
            <span className="font-serif text-sm sm:text-base font-bold text-gold">04</span>
            <p className="text-xs sm:text-[13px] font-bold text-white tracking-wide">
              Pan-India Dispatch
            </p>
            <p className="text-[10.5px] sm:text-[11px] text-[#D1CABF] leading-relaxed">
              Direct individual recipient home dropshipping or consolidated bulk delivery to your
              corporate offices.
            </p>
          </div>
        </div>
      </div>

      {/* Back Cover Lower Section: 4 Enterprise Guarantees */}
      <div className="relative z-10 my-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-xl mx-auto text-[10px] sm:text-[10.5px]">
          <div className="flex items-center justify-center gap-1.5 rounded-lg border border-gold/25 bg-black/20 py-2 px-2 text-[#E0D8CB]">
            <Sparkles className="size-3.5 text-gold shrink-0" />
            <span className="font-medium truncate">Bespoke Branding</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 rounded-lg border border-gold/25 bg-black/20 py-2 px-2 text-[#E0D8CB]">
            <ShieldCheck className="size-3.5 text-gold shrink-0" />
            <span className="font-medium truncate">Quality Certified</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 rounded-lg border border-gold/25 bg-black/20 py-2 px-2 text-[#E0D8CB]">
            <Truck className="size-3.5 text-gold shrink-0" />
            <span className="font-medium truncate">Express Dispatch</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 rounded-lg border border-gold/25 bg-black/20 py-2 px-2 text-[#E0D8CB]">
            <Award className="size-3.5 text-gold shrink-0" />
            <span className="font-medium truncate">Tier Pricing</span>
          </div>
        </div>
      </div>

      {/* Back Cover Bottom: Studio & Showroom Section */}
      <div className="relative z-10 border-t border-gold/30 pt-3 sm:pt-4 text-xs text-[#B8B1A2] print:text-[10px]">
        <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-3 text-center sm:text-left max-w-xl mx-auto">
          <div>
            <p className="font-semibold text-white text-xs sm:text-sm">
              {BUSINESS.name} Studio &amp; Showroom
            </p>
            <p className="text-[10.5px] sm:text-[11px] text-[#B8B1A2] mt-0.5">
              {BUSINESS.addressLine}
            </p>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-[11px] sm:text-[11.5px]">
              <strong className="text-white">Direct Desk:</strong> {BUSINESS.phoneDisplay}
            </p>
            <p className="text-[10.5px] sm:text-[11px] text-[#B8B1A2] mt-0.5">
              <strong>Email:</strong> {BUSINESS.email} · <strong>Web:</strong> {BUSINESS.siteUrl}
            </p>
          </div>
        </div>
        <p className="mt-2.5 text-[8.5px] sm:text-[9px] text-[#8C8375] text-center">
          © 2026 Urban Craft &amp; Co. All rights reserved. Registered Enterprise Gifting Partner.
        </p>
      </div>
    </section>
  );

  return (
    <div
      className={cn(
        "min-h-screen bg-[#FAF8F5] text-[#242D23] pb-28 md:pb-16",
        density === 12 ? "catalogue-density-12" : "catalogue-density-9",
      )}
    >
      {/* ─────────────────────────────────────────────────────────────
          STREAMLINED TOP CONTROLS (Screen Only, Hidden in Print)
      ───────────────────────────────────────────────────────────── */}
      <nav
        className="no-print sticky top-[var(--header-h,72px)] z-30 border-b border-[#E3DDD1] bg-[#FAF8F5]/95 backdrop-blur-md"
        aria-label="Catalogue options"
      >
        <div className="mx-auto max-w-7xl px-3 sm:px-6 py-2">
          {/* Single Unified Clean Controls Row */}
          <div className="flex items-center justify-between gap-2">
            {/* Left: Brand & Collection Jump */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-display text-xs sm:text-sm font-bold text-olive shrink-0 hidden xs:inline">
                Catalogue
              </span>

              {/* Jump to Collection Navigator */}
              <div className="relative">
                <select
                  onChange={(e) => {
                    if (e.target.value) jumpToCategory(e.target.value);
                  }}
                  defaultValue=""
                  className="h-8 sm:h-8.5 max-w-[145px] xs:max-w-[180px] sm:max-w-[215px] rounded-lg border border-[#D8D2C5] bg-white px-2.5 pr-7 text-xs font-semibold text-olive shadow-2xs outline-none focus:border-brown cursor-pointer appearance-none truncate"
                  aria-label="Browse Collections"
                >
                  <option value="" disabled>
                    Collections ({CATEGORIES.length})
                  </option>
                  {CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name} ({productsByCategory.get(c.slug)?.length ?? 0})
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            {/* Center: Density Toggle (9 vs 12) - Sleek Segmented Pill */}
            <div className="flex items-center rounded-lg border border-[#D8D2C5] bg-white p-0.5 text-xs shadow-2xs shrink-0">
              <button
                type="button"
                onClick={() => setDensity(9)}
                className={cn(
                  "rounded-md px-2 sm:px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
                  density === 9
                    ? "bg-olive text-white font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
                title="9 items per page (3 rows of 3)"
              >
                9 / Page
              </button>
              <button
                type="button"
                onClick={() => setDensity(12)}
                className={cn(
                  "rounded-md px-2 sm:px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
                  density === 12
                    ? "bg-olive text-white font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
                title="12 items per page (4 rows of 3)"
              >
                12 / Page
              </button>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* View Mode Toggle: Book vs Scroll */}
              <button
                type="button"
                onClick={() => setViewMode(viewMode === "book" ? "scroll" : "book")}
                className="hidden sm:inline-flex h-8 sm:h-8.5 items-center gap-1.5 rounded-lg border border-[#D8D2C5] bg-white px-2.5 text-xs font-medium text-olive hover:bg-muted cursor-pointer transition-colors shadow-2xs"
                title={
                  viewMode === "book"
                    ? "Switch to Continuous Scroll View"
                    : "Switch to Interactive Book View"
                }
              >
                {viewMode === "book" ? (
                  <>
                    <List className="size-3.5 text-olive" />
                    <span className="hidden md:inline">Scroll View</span>
                  </>
                ) : (
                  <>
                    <BookOpen className="size-3.5 text-olive" />
                    <span className="hidden md:inline">Book View</span>
                  </>
                )}
              </button>

              {/* WhatsApp Button with official WhatsAppIcon matching the rest of the website */}
              <Button
                asChild
                variant="whatsapp"
                className="h-8 sm:h-8.5 rounded-lg px-2 sm:px-3 text-xs font-medium gap-1.5 cursor-pointer shadow-2xs"
              >
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Chat on WhatsApp"
                >
                  <WhatsAppIcon className="size-3.5 text-whatsapp" />
                  <span className="hidden sm:inline">WhatsApp</span>
                </a>
              </Button>

              {/* PRIMARY DOWNLOAD PDF BUTTON: Instantly downloads pre-compiled PDF */}
              <Button
                asChild
                className="h-8 sm:h-8.5 rounded-lg bg-olive px-2.5 sm:px-3.5 text-xs font-semibold text-white shadow-2xs hover:bg-olive/90 gap-1.5 cursor-pointer"
              >
                <a
                  href={cataloguePdfUrl}
                  download="Corporate Gifting Catalogue (Complete 2026 Collection) Urban Craft & Co.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Download complete 2026 Lookbook PDF"
                >
                  <Download className="size-3.5 text-gold" />
                  <span className="hidden xs:inline">Download</span>
                  <span>PDF</span>
                </a>
              </Button>

              {/* DEV / LOCALHOST ONLY: Browser Print / Render Option */}
              {isLocalhost && (
                <Button
                  type="button"
                  onClick={() => window.print()}
                  variant="outline"
                  className="hidden md:inline-flex h-8 sm:h-8.5 rounded-lg border-[#D8D2C5] bg-white px-2.5 text-xs font-medium text-olive hover:bg-olive hover:text-white hover:border-olive gap-1.5 cursor-pointer shadow-2xs transition-colors"
                  title="Localhost only: browser print / re-render full print engine"
                >
                  <Printer className="size-3.5 text-current" />
                  <span>Print (Dev)</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ─────────────────────────────────────────────────────────────
          SCREEN: INTERACTIVE BOOK READER (When in Book Mode)
      ───────────────────────────────────────────────────────────── */}
      {viewMode === "book" && (
        <div className="no-print mx-auto max-w-7xl px-3 sm:px-6 pt-4 sm:pt-6 pb-12 sm:pb-16">
          {/* =========================================================
              TWO-PAGE SPREAD VIEW (Active by default on Desktop >= 1024px)
          ========================================================= */}
          {spreadMode === "double" && (
            <div className="hidden lg:block">
              <div className="relative flex items-center justify-center">
                {/* Left Page Turn Button (Floating) */}
                <button
                  type="button"
                  onClick={prevSpread}
                  disabled={activeSpreadIndex === 0}
                  aria-label="Previous Spread"
                  className="absolute -left-10 xl:-left-16 top-1/2 -translate-y-1/2 z-20 h-11 w-11 xl:h-12 xl:w-12 items-center justify-center rounded-full border border-[#D8D2C5] bg-white/95 text-olive shadow-lift hover:bg-muted disabled:opacity-20 disabled:pointer-events-none cursor-pointer transition-all flex"
                >
                  <ChevronLeft className="size-6" />
                </button>

                {/* Animated Spread Stage */}
                <div className="w-full max-w-[1240px] overflow-hidden">
                  <AnimatePresence mode="wait" custom={slideDirection}>
                    <motion.div
                      key={`spread-${activeSpreadIndex}`}
                      custom={slideDirection}
                      initial={{
                        opacity: 0,
                        x: slideDirection > 0 ? 35 : -35,
                        scale: 0.99,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        scale: 1,
                        transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
                      }}
                      exit={{
                        opacity: 0,
                        x: slideDirection > 0 ? -35 : 35,
                        scale: 0.99,
                        transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
                      }}
                      className="w-full"
                    >
                      {/* Spread 0: Front Cover (Centered) */}
                      {spreads[activeSpreadIndex]?.type === "cover" && (
                        <div className="flex justify-center">{renderFrontCover(true)}</div>
                      )}

                      {/* Interior Spreads: 2 Pages Side-by-Side (Consistent A4 heights) */}
                      {spreads[activeSpreadIndex]?.type === "spread" && (
                        <div className="flex items-stretch justify-center w-full shadow-2xl rounded-2xl overflow-hidden bg-[#FAF8F5]">
                          {/* Left Page */}
                          <div className="w-1/2 flex">
                            {spreads[activeSpreadIndex].leftChunk &&
                              renderInteriorPage(
                                spreads[activeSpreadIndex].leftChunk!,
                                spreads[activeSpreadIndex].leftIndex!,
                                "left",
                              )}
                          </div>

                          {/* Right Page (or dignified inside notes spread) */}
                          <div className="w-1/2 flex">
                            {spreads[activeSpreadIndex].rightChunk ? (
                              renderInteriorPage(
                                spreads[activeSpreadIndex].rightChunk!,
                                spreads[activeSpreadIndex].rightIndex!,
                                "right",
                              )
                            ) : (
                              <div className="min-h-[520px] sm:min-h-[740px] md:min-h-[920px] aspect-auto sm:aspect-[1/1.414] w-full bg-white rounded-r-2xl border border-l-0 border-[#E3DDD1] p-8 flex flex-col items-center justify-center text-center shadow-[10px_10px_25px_rgba(0,0,0,0.06)]">
                                <Logo variant="header" height={28} />
                                <p className="mt-4 font-serif text-sm italic text-[#8C8375]">
                                  Notes &amp; Custom Curation Inquiries
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Final Spread: Back Cover (Centered) */}
                      {spreads[activeSpreadIndex]?.type === "backCover" && (
                        <div className="flex justify-center">{renderBackCover(true)}</div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Right Page Turn Button (Floating) */}
                <button
                  type="button"
                  onClick={nextSpread}
                  disabled={activeSpreadIndex === spreads.length - 1}
                  aria-label="Next Spread"
                  className="absolute -right-10 xl:-right-16 top-1/2 -translate-y-1/2 z-20 h-11 w-11 xl:h-12 xl:w-12 items-center justify-center rounded-full border border-[#D8D2C5] bg-white/95 text-olive shadow-lift hover:bg-muted disabled:opacity-20 disabled:pointer-events-none cursor-pointer transition-all flex"
                >
                  <ChevronRight className="size-6" />
                </button>
              </div>

              {/* Spread Bottom Navigation Pill */}
              <div className="sticky bottom-[calc(76px+env(safe-area-inset-bottom,0px))] md:bottom-5 z-20 mt-4 mx-auto max-w-sm rounded-full border border-[#D8D2C5] bg-white/95 px-3 py-1.5 shadow-lift backdrop-blur-md flex items-center justify-between gap-3 text-xs">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevSpread}
                  disabled={activeSpreadIndex === 0}
                  className="h-7 w-7 p-0 rounded-full text-olive hover:bg-muted disabled:opacity-20 cursor-pointer shrink-0"
                  title="Previous Spread (Left Arrow)"
                >
                  <ChevronLeft className="size-4" />
                </Button>

                <div className="flex flex-col items-center min-w-0 text-center px-1">
                  <span className="font-mono text-xs font-bold text-olive">
                    Spread {activeSpreadIndex + 1} of {spreads.length}
                  </span>
                  <span className="text-[10.5px] font-medium text-[#7A7163] max-w-[220px] truncate">
                    {spreads[activeSpreadIndex]?.label}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextSpread}
                  disabled={activeSpreadIndex === spreads.length - 1}
                  className="h-7 w-7 p-0 rounded-full text-olive hover:bg-muted disabled:opacity-20 cursor-pointer shrink-0"
                  title="Next Spread (Right Arrow)"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* =========================================================
              SINGLE-PAGE VIEW (Fallback on Mobile/Tablet or by choice)
          ========================================================= */}
          <div className={cn(spreadMode === "double" ? "lg:hidden" : "block")}>
            <div className="relative flex items-center justify-center">
              {/* Left Page Turn Button (Desktop / Tablet) */}
              <button
                type="button"
                onClick={prevPage}
                disabled={activePageIndex === 0}
                aria-label="Previous Page"
                className="hidden sm:flex absolute -left-12 top-1/2 -translate-y-1/2 z-20 h-11 w-11 items-center justify-center rounded-full border border-[#D8D2C5] bg-white/95 text-olive shadow-lift hover:bg-muted disabled:opacity-20 disabled:pointer-events-none cursor-pointer transition-all"
              >
                <ChevronLeft className="size-5" />
              </button>

              {/* Animated Single Page Stage with Mobile Touch Swipe Pan */}
              <div
                className="w-full max-w-[850px] overflow-hidden touch-pan-y"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <AnimatePresence mode="wait" custom={slideDirection}>
                  <motion.div
                    key={activePageIndex}
                    custom={slideDirection}
                    initial={{
                      opacity: 0,
                      x: slideDirection > 0 ? 30 : -30,
                      scale: 0.985,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      scale: 1,
                      transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
                    }}
                    exit={{
                      opacity: 0,
                      x: slideDirection > 0 ? -30 : 30,
                      scale: 0.985,
                      transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
                    }}
                    className="w-full"
                  >
                    {activePageIndex === 0 && renderFrontCover()}
                    {activePageIndex > 0 &&
                      activePageIndex < totalPages - 1 &&
                      pageChunks[activePageIndex - 1] &&
                      renderInteriorPage(pageChunks[activePageIndex - 1]!, activePageIndex - 1)}
                    {activePageIndex === totalPages - 1 && renderBackCover()}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Right Page Turn Button (Desktop / Tablet) */}
              <button
                type="button"
                onClick={nextPage}
                disabled={activePageIndex === totalPages - 1}
                aria-label="Next Page"
                className="hidden sm:flex absolute -right-12 top-1/2 -translate-y-1/2 z-20 h-11 w-11 items-center justify-center rounded-full border border-[#D8D2C5] bg-white/95 text-olive shadow-lift hover:bg-muted disabled:opacity-20 disabled:pointer-events-none cursor-pointer transition-all"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>

            {/* Single Page Floating Bottom Navigation Pill */}
            <div className="sticky bottom-[calc(76px+env(safe-area-inset-bottom,0px))] md:bottom-5 z-20 mt-4 mx-auto max-w-sm rounded-full border border-[#D8D2C5] bg-white/95 px-3 py-1.5 shadow-lift backdrop-blur-md flex items-center justify-between gap-3 text-xs">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevPage}
                disabled={activePageIndex === 0}
                className="h-7 w-7 p-0 rounded-full text-olive hover:bg-muted disabled:opacity-20 cursor-pointer shrink-0"
                title="Previous Page (Swipe or Left Arrow)"
              >
                <ChevronLeft className="size-4" />
              </Button>

              <div className="flex flex-col items-center min-w-0 text-center px-1">
                <span className="font-mono text-xs font-bold text-olive">
                  Page {activePageIndex + 1} of {totalPages}
                </span>
                <span className="text-[10.5px] font-medium text-[#7A7163] max-w-[200px] truncate">
                  {activeSinglePageLabel}
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={nextPage}
                disabled={activePageIndex === totalPages - 1}
                className="h-7 w-7 p-0 rounded-full text-olive hover:bg-muted disabled:opacity-20 cursor-pointer shrink-0"
                title="Next Page (Swipe or Right Arrow)"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          CONTINUOUS SCROLL (Screen when in Scroll Mode)
      ───────────────────────────────────────────────────────────── */}
      {viewMode === "scroll" && (
        <div className="no-print mx-auto max-w-5xl px-3 sm:px-8 py-6 sm:py-8 space-y-6 sm:space-y-10">
          {renderFrontCover()}
          {pageChunks.map((chunk, idx) => renderInteriorPage(chunk, idx))}
          {renderBackCover()}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          PRINT ENGINE: ALL PAGES PRINT SEQUENTIALLY
          Localhost/dev only: Hidden on screen in book mode, rendered for print
      ───────────────────────────────────────────────────────────── */}
      {isLocalhost && (
        <div className="hidden print:block">
          {renderFrontCover()}
          {pageChunks.map((chunk, idx) => renderInteriorPage(chunk, idx))}
          {renderBackCover()}
        </div>
      )}
    </div>
  );
}
