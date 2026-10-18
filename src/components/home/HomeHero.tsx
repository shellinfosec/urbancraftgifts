import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOverlays } from "@/components/providers/OverlayProvider";
import { LOGO_ASSETS } from "@/config/brand";
import { VALUE_PROPS } from "@/config/content";
import { pickFrom, PRODUCTS } from "@/lib/catalog";
import { BrandImage } from "@/components/common/BrandImage";
import heroImg from "@/assets/hero-gifting.jpg";

const FEATURE = pickFrom("5-in-1-gift-sets", 1, 2)[0] ?? PRODUCTS[0];
const SIDE = pickFrom("bottles-drinkware", 1, 0)[0];

export function HomeHero() {
  const { openInquiry, openQuickView } = useOverlays();
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const yImg = useTransform(scrollY, [0, 700], [0, reduce ? 0 : 60]);
  const yCard = useTransform(scrollY, [0, 700], [0, reduce ? 0 : -40]);

  return (
    <section className="relative overflow-hidden bg-background" aria-labelledby="hero-title">
      <div className="container-site grid items-center gap-10 pb-14 pt-6 md:pb-20 md:pt-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14 lg:pb-24 lg:pt-16">
        <div className="relative z-10 order-2 max-w-xl lg:order-1">
          <h1
            id="hero-title"
            className="font-display text-[2.15rem] leading-[1.12] text-olive sm:text-5xl lg:text-[3.5rem]"
          >
            Gifts your team and clients will{" "}
            <em className="font-normal italic text-brown">actually use.</em>
          </h1>
          <p className="mt-5 max-w-md text-[1rem] leading-relaxed text-slate">
            Boxed gift sets, laptop bags, drinkware and welcome kits - branded with your logo and
            coordinated from shortlist to delivery.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to="/products">
                Explore gifts <ArrowRight />
              </Link>
            </Button>
            <Button size="lg" variant="outline" onClick={() => openInquiry()}>
              <Send /> Plan a bulk order
            </Button>
          </div>
        </div>

        <div className="relative order-1 mb-4 lg:order-2 lg:mb-0">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-olive shadow-lift lg:aspect-[16/13]">
            <motion.div style={{ y: yImg }} className="absolute inset-0 h-[112%] w-full">
              <img
                src={heroImg}
                alt="A boxed notebook, pen and bottle gift set beside a leather laptop bag and jute tote on olive linen"
                width={1600}
                height={1104}
                fetchPriority="high"
                loading="eager"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </motion.div>
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-olive-deep/40 via-transparent to-transparent"
            />
          </div>

          {FEATURE && (
            <motion.button
              type="button"
              style={{ y: yCard }}
              onClick={() => openQuickView(FEATURE.sku)}
              className="group absolute -bottom-6 left-3 flex w-[min(300px,78%)] items-center gap-3 rounded-2xl border border-border bg-card/95 p-3 text-left shadow-lift backdrop-blur sm:left-[-24px] lg:-bottom-8"
            >
              <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-stage-sand">
                <BrandImage
                  src={FEATURE.images[0]}
                  alt={FEATURE.name}
                  loading="eager"
                  fetchPriority="high"
                  className="h-full w-full p-1.5"
                  imgClassName="object-contain transition-transform duration-500 group-hover:scale-[1.04]"
                />
              </span>
              <span className="min-w-0">
                <span className="eyebrow block text-[0.6rem] text-brown">Featured set</span>
                <span className="mt-1 line-clamp-2 block text-sm font-semibold leading-snug text-olive">
                  {FEATURE.name}
                </span>
                <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-slate">
                  View details{" "}
                  <ArrowRight className="size-3 transition group-hover:translate-x-0.5" />
                </span>
              </span>
            </motion.button>
          )}
          {SIDE && (
            <div className="absolute -top-5 right-4 hidden h-28 w-28 rounded-full border border-border bg-card p-2 shadow-lift sm:block">
              <img
                src={LOGO_ASSETS.compactStacked.src}
                alt="Urban Craft & Co."
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="h-full w-full object-contain p-1"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function TrustStrip() {
  return (
    <section aria-label="What we offer" className="border-b border-border bg-paper">
      <ul className="container-site grid grid-cols-2 gap-x-4 gap-y-6 py-7 md:grid-cols-4 md:py-9">
        {VALUE_PROPS.map(({ title, body, icon: Icon }) => (
          <li key={title} className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sand text-olive">
              <Icon className="size-[18px]" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-olive">{title}</span>
              <span className="block text-xs leading-relaxed text-muted-foreground">{body}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
