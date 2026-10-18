import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Keyboard, Navigation } from "swiper/modules";
import "swiper/css";
import { ArrowRight, ChevronLeft, ChevronRight, Leaf, Send } from "lucide-react";
import { SectionHeader } from "@/components/common/PageParts";
import { ProductCard } from "@/components/product/ProductCard";
import { STAGE_TONE } from "@/components/product/ProductImageStage";
import { useOverlays } from "@/components/providers/OverlayProvider";
import { Button } from "@/components/ui/button";
import { CATEGORIES, requireCategory, type Category } from "@/config/categories";
import { PROCESS_STEPS } from "@/config/content";
import { categoryCount, pickFrom } from "@/lib/catalog";
import { BrandImage } from "@/components/common/BrandImage";
import { cn } from "@/lib/utils";

function CategoryTile({
  c,
  big,
  offset = 0,
  dark,
}: {
  c: Category;
  big?: boolean;
  offset?: number;
  dark?: "green" | "brown" | undefined;
}) {
  const img = pickFrom(c.slug, 1, offset)[0];
  return (
    <Link
      to="/categories/$slug"
      params={{ slug: c.slug }}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-border p-5 transition-shadow hover:shadow-lift md:p-6",
        dark === "green" ? "bg-olive" : dark === "brown" ? "bg-brown-deep" : STAGE_TONE[c.tone],
        big ? "min-h-[300px] md:min-h-[420px]" : "min-h-[200px]",
      )}
    >
      <div className="relative z-10">
        <p className={cn("text-xs", dark ? "text-primary-foreground/75" : "text-muted-foreground")}>
          {categoryCount(c.slug)} products
        </p>
        <h3
          className={cn(
            "mt-1 font-display",
            dark ? "text-primary-foreground" : "text-olive",
            big ? "text-2xl md:text-3xl" : "text-lg",
          )}
        >
          {c.name}
        </h3>
      </div>
      {img && (
        <BrandImage
          src={img.images[0]}
          alt=""
          loading="lazy"
          className={cn(
            "pointer-events-none absolute aspect-square object-contain transition-transform duration-500 group-hover:scale-[1.03]",
            big ? "bottom-3 right-3 top-[28%] w-[72%]" : "bottom-2 right-2 top-[38%] w-[50%]",
          )}
        />
      )}
      <span
        className={cn(
          "relative z-10 inline-flex items-center gap-1 text-sm font-semibold",
          dark ? "text-primary-foreground" : "text-olive",
        )}
      >
        Shop <ArrowRight className="size-4 transition group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

export function ShopByCategory() {
  const g = requireCategory;
  return (
    <section className="container-site section-y" aria-labelledby="cats">
      <SectionHeader
        id="cats"
        eyebrow="Shop by category"
        title="Start with what you need"
        body="Gift sets, bags, drinkware and essentials for your next gifting brief."
        action={
          <Button asChild variant="outline">
            <Link to="/products">
              View all products <ArrowRight />
            </Link>
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-4 md:grid-rows-2">
        <div className="md:col-span-2 md:row-span-2">
          <CategoryTile c={g("3-in-1-gift-sets")} big offset={3} />
        </div>
        <div className="md:col-span-2">
          <CategoryTile c={g("leather-laptop-bags")} />
        </div>
        <CategoryTile c={g("bottles-drinkware")} offset={1} />
        <CategoryTile c={g("employee-welcome-kits")} />
      </div>
      <ul className="mt-6 flex gap-2 overflow-x-auto pb-2 no-scrollbar" aria-label="All categories">
        {CATEGORIES.map((c) => (
          <li key={c.slug} className="shrink-0">
            <Link
              to="/categories/$slug"
              params={{ slug: c.slug }}
              className="inline-flex h-10 items-center rounded-full border border-border bg-card px-4 text-sm font-medium text-olive hover:border-olive"
            >
              {c.shortName}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

const SET_SIZES = [2, 3, 4, 5, 6, 7];

export function GiftSetShowcase() {
  const [size, setSize] = useState(3);
  const slug = `${size}-in-1-gift-sets`;
  const items = pickFrom(slug, 4);
  return (
    <section className="bg-olive section-y text-primary-foreground" aria-labelledby="sets">
      <div className="container-site">
        <SectionHeader
          id="sets"
          tone="dark"
          eyebrow="Curated gift sets"
          title="Gift sets, thoughtfully put together"
          body="Each set arrives arranged in its own presentation box. Choose by how complete you want the gift to feel."
        />
        <div
          role="tablist"
          aria-label="Set size"
          className="mb-8 flex gap-2 overflow-x-auto no-scrollbar"
        >
          {SET_SIZES.map((n) => (
            <button
              key={n}
              role="tab"
              aria-selected={n === size}
              onClick={() => setSize(n)}
              className={cn(
                "h-10 shrink-0 rounded-full border px-5 text-sm font-semibold transition",
                n === size
                  ? "border-gold bg-gold text-charcoal"
                  : "border-primary-foreground/25 text-primary-foreground/80 hover:border-primary-foreground/60",
              )}
            >
              {n}-in-1
            </button>
          ))}
        </div>
        <motion.ul
          key={slug}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4"
          role="tabpanel"
        >
          {items.map((p) => (
            <li key={p.sku} className="flex">
              <ProductCard product={p} className="w-full border-transparent" />
            </li>
          ))}
        </motion.ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild variant="ivory">
            <Link to="/categories/$slug" params={{ slug }}>
              All {size}-in-1 sets ({categoryCount(slug)}) <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline-light">
            <Link to="/categories/$slug" params={{ slug: "premium-bigger-gift-sets" }}>
              Premium bigger sets
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function ProcessStory() {
  return (
    <section className="container-site section-y" aria-labelledby="process">
      <SectionHeader
        id="process"
        eyebrow="How it works"
        title="From shortlist to delivery in four steps"
        align="center"
      />
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PROCESS_STEPS.map(({ title, body, icon: Icon }, i) => (
          <li key={title} className="relative rounded-3xl border border-border bg-card p-6">
            <span className="font-display text-4xl text-sand">0{i + 1}</span>
            <Icon className="absolute right-6 top-7 size-6 text-brown" strokeWidth={1.5} />
            <h3 className="mt-3 font-sans text-base font-semibold text-olive">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate">{body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

const CURATED = [
  "4-in-1-gift-sets",
  "backpacks",
  "6-in-1-gift-sets",
  "felt-carry-bags",
  "2-in-1-gift-sets",
  "duffle-bags",
  "7-in-1-gift-sets",
  "conference-folders",
].flatMap((s) => (pickFrom(s, 1, 1).length ? pickFrom(s, 1, 1) : pickFrom(s, 1)));

export function CuratedRail() {
  return (
    <section className="overflow-hidden bg-paper section-y" aria-labelledby="curated">
      <div className="container-site">
        <SectionHeader
          id="curated"
          eyebrow="Curated picks"
          title="A cross-section of the collection"
          action={
            <div className="hidden gap-2 md:flex">
              <button
                className="curated-prev inline-flex h-11 w-11 items-center justify-center rounded-full border border-border hover:bg-muted"
                aria-label="Previous"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                className="curated-next inline-flex h-11 w-11 items-center justify-center rounded-full border border-border hover:bg-muted"
                aria-label="Next"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          }
        />
        <Swiper
          modules={[Navigation, A11y, Keyboard]}
          keyboard
          navigation={{ prevEl: ".curated-prev", nextEl: ".curated-next" }}
          spaceBetween={16}
          slidesPerView={1.6}
          breakpoints={{
            640: { slidesPerView: 2.5 },
            1024: { slidesPerView: 3.4 },
            1280: { slidesPerView: 4 },
          }}
          className="!overflow-visible"
        >
          {CURATED.map((p) => (
            <SwiperSlide key={p.sku} className="!h-auto">
              <ProductCard product={p} className="h-full" />
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="mt-8">
          <Button asChild size="lg">
            <Link to="/products">
              Browse the collection <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function WelcomeKitsFeature() {
  const { openInquiry } = useOverlays();
  const kits = pickFrom("employee-welcome-kits", 3);
  return (
    <section className="container-site section-y" aria-labelledby="kits">
      <div className="grid overflow-hidden rounded-3xl bg-stage-sage md:grid-cols-2">
        <div className="flex flex-col justify-center p-8 md:p-14">
          <p className="eyebrow text-brown">Employee welcome kits</p>
          <h2
            id="kits"
            className="mt-2 font-display text-[1.8rem] leading-tight text-olive md:text-[2.2rem]"
          >
            A considered first day for every new joiner
          </h2>
          <p className="mt-4 leading-relaxed text-slate">
            Bag, bottle, notebook, pen and desk essentials, packed together and branded to match
            your company. Plan kits for a single hiring drive or set them up for ongoing onboarding.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link to="/categories/$slug" params={{ slug: "employee-welcome-kits" }}>
                See welcome kits <ArrowRight />
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                openInquiry({ intent: "onboarding", categories: ["employee-welcome-kits"] })
              }
            >
              <Send /> Plan onboarding kits
            </Button>
          </div>
        </div>
        <div className="relative min-h-[300px] md:min-h-[460px]">
          <div aria-hidden className="stage-glow absolute inset-0" />
          {kits[1] && (
            <BrandImage
              src={kits[1].images[0]}
              alt={kits[1].alt}
              loading="lazy"
              className="absolute left-[4%] top-[8%] aspect-square w-[48%] -rotate-3"
              imgClassName="object-contain drop-shadow-xl"
            />
          )}
          {kits[2] && (
            <BrandImage
              src={kits[2].images[0]}
              alt={kits[2].alt}
              loading="lazy"
              className="absolute right-[4%] top-[4%] aspect-square w-[42%] rotate-3"
              imgClassName="object-contain drop-shadow-xl"
            />
          )}
          {kits[0] && (
            <BrandImage
              src={kits[0].images[0]}
              alt={kits[0].alt}
              loading="lazy"
              className="absolute bottom-[4%] left-1/2 aspect-square w-[58%] -translate-x-1/2"
              imgClassName="object-contain drop-shadow-xl"
            />
          )}
        </div>
      </div>
    </section>
  );
}

export function BagsMosaic() {
  const bags = ["leather-laptop-bags", "backpacks", "duffle-bags", "eco-friendly-laptop-bags"].map(
    requireCategory,
  );
  return (
    <section className="bg-stage-stone section-y" aria-labelledby="bags">
      <div className="container-site grid gap-10 lg:grid-cols-[0.8fr_1.6fr] lg:items-center">
        <div>
          <SectionHeader
            id="bags"
            eyebrow="Bags for work & travel"
            title="Carried daily, seen often"
            body="Laptop bags, backpacks and duffles are among the most-used corporate gifts - which makes them one of the best places for your logo."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {bags.map((c, i) => (
            <CategoryTile
              key={c.slug}
              c={c}
              offset={i}
              dark={
                c.slug === "backpacks" ? "green" : c.slug === "duffle-bags" ? "brown" : undefined
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function EcoSection() {
  const eco = ["jute-carry-bags", "felt-carry-bags", "eco-friendly-laptop-bags"].map(
    requireCategory,
  );
  return (
    <section className="container-site section-y" aria-labelledby="eco">
      <div className="rounded-3xl border border-sage/50 bg-stage-sage/60 p-6 md:p-12">
        <div className="flex items-center gap-2 text-olive">
          <Leaf className="size-5" />
          <span className="eyebrow">Natural materials</span>
        </div>
        <h2
          id="eco"
          className="mt-2 max-w-xl font-display text-[1.7rem] leading-tight text-olive md:text-[2.1rem]"
        >
          Jute, felt and natural-look laptop bags
        </h2>
        <p className="mt-3 max-w-xl text-slate">
          For teams that prefer earthy textures and lighter materials. Materials are listed on each
          product so you can choose with clarity.
        </p>
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {eco.map((c) => {
            const img = pickFrom(c.slug, 1, 2)[0] ?? pickFrom(c.slug, 1)[0];
            return (
              <li key={c.slug}>
                <Link
                  to="/categories/$slug"
                  params={{ slug: c.slug }}
                  className="group flex items-center gap-4 rounded-2xl bg-card p-4 transition hover:shadow-soft"
                >
                  {img && (
                    <BrandImage
                      src={img.images[0]}
                      alt=""
                      loading="lazy"
                      className="h-24 w-24 shrink-0 object-contain transition-transform group-hover:scale-[1.03]"
                    />
                  )}
                  <span>
                    <span className="block font-semibold text-olive">{c.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {categoryCount(c.slug)} products
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
