import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight, Send, Trash2 } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Keyboard, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { EmptyState, PageHeader } from "@/components/common/PageParts";
import { ProductGrid } from "@/components/product/ProductCard";
import { useOverlays } from "@/components/providers/OverlayProvider";
import { Button } from "@/components/ui/button";
import { categoryCount, getProduct, pickFrom, type Product } from "@/lib/catalog";
import { useFavorites } from "@/lib/favorites";
import { pageHead } from "@/lib/seo";
import { CATEGORIES } from "@/config/categories";
import { STAGE_TONE } from "@/components/product/ProductImageStage";
import { BrandImage } from "@/components/common/BrandImage";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/favorites")({
  head: () => {
    const h = pageHead({
      title: "Your Favourites",
      description:
        "Products you've saved on this device. Send your shortlist to Urban Craft & Co. in one enquiry.",
      path: "/favorites",
    });
    return { ...h, meta: [...h.meta, { name: "robots", content: "noindex" }] };
  },
  component: FavoritesPage,
});

function FavoritesSkeleton() {
  return (
    <div role="status" className="space-y-4" aria-busy="true" aria-label="Loading favourites">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card animate-pulse"
          >
            <div className="aspect-[4/3] w-full bg-muted/70" />
            <div className="space-y-2 p-3.5">
              <div className="h-4 w-3/4 rounded-md bg-muted/80" />
              <div className="h-3 w-1/2 rounded-md bg-muted/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoriesCarousel() {
  return (
    <section
      className="mt-16 border-t border-border/70 pt-12"
      aria-labelledby="all-categories-heading"
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-brown">Explore the catalogue</p>
          <h2 id="all-categories-heading" className="font-display text-2xl text-olive md:text-3xl">
            All Product Categories
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse our full range of curated corporate gifts, bags, drinkware and welcome kits.
          </p>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            className="cat-prev inline-flex size-10 items-center justify-center rounded-full border border-border bg-card text-olive shadow-2xs transition hover:bg-muted"
            aria-label="Previous categories"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            className="cat-next inline-flex size-10 items-center justify-center rounded-full border border-border bg-card text-olive shadow-2xs transition hover:bg-muted"
            aria-label="Next categories"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>

      <Swiper
        modules={[Navigation, Pagination, A11y, Keyboard]}
        keyboard
        loop={true}
        navigation={{ prevEl: ".cat-prev", nextEl: ".cat-next" }}
        pagination={{
          el: ".cat-pagination",
          clickable: true,
          bulletClass:
            "inline-block size-2 rounded-full bg-border transition-all cursor-pointer mx-1",
          bulletActiveClass: "!w-6 !bg-olive",
        }}
        spaceBetween={16}
        slidesPerView={1.25}
        breakpoints={{
          640: { slidesPerView: 2.2, spaceBetween: 16 },
          768: { slidesPerView: 3.2, spaceBetween: 18 },
          1024: { slidesPerView: 4, spaceBetween: 20 },
        }}
        className="overflow-visible"
      >
        {CATEGORIES.map((c) => {
          const img = pickFrom(c.slug, 1)[0];
          return (
            <SwiperSlide key={c.slug} className="!h-auto">
              <Link
                to="/categories/$slug"
                params={{ slug: c.slug }}
                className={cn(
                  "group flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border p-4 transition-all duration-300 hover:border-olive/50 hover:shadow-soft",
                  STAGE_TONE[c.tone],
                )}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      {categoryCount(c.slug)} products
                    </span>
                    <ArrowRight className="size-4 text-olive/60 transition group-hover:translate-x-1 group-hover:text-olive" />
                  </div>
                  <h3 className="mt-2 font-display text-lg text-olive group-hover:text-olive-deep">
                    {c.name}
                  </h3>
                </div>
                <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-xl bg-card/60 p-2">
                  {img && (
                    <BrandImage
                      src={img.images[0]}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.05]"
                    />
                  )}
                </div>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>

      <div className="cat-pagination mt-6 flex justify-center" />
    </section>
  );
}

function FavoritesPage() {
  const [mounted, setMounted] = useState(false);
  const fav = useFavorites();
  const { openInquiry } = useOverlays();

  useEffect(() => {
    setMounted(true);
  }, []);

  const products = mounted ? fav.list.map(getProduct).filter((p): p is Product => !!p) : [];

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Favourites" }]}
        eyebrow="Saved on this device"
        title="Your favourites"
        intro="Build a shortlist, then send it to us in one enquiry."
      >
        {mounted && products.length > 0 && (
          <div className="flex gap-2">
            <Button variant="ghost" onClick={fav.clear}>
              <Trash2 /> Clear
            </Button>
            <Button onClick={() => openInquiry({ products: products.map((p) => p.sku) })}>
              <Send /> Enquire about {products.length}
            </Button>
          </div>
        )}
      </PageHeader>
      <div className="container-site pb-20">
        {!mounted ? (
          <FavoritesSkeleton />
        ) : products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <EmptyState
            title="No favourites yet"
            body="Tap the heart on any product to save it here. Your list stays on this device."
            action={
              <Button asChild>
                <Link to="/products">Browse products</Link>
              </Button>
            }
          />
        )}

        <CategoriesCarousel />
      </div>
    </>
  );
}
