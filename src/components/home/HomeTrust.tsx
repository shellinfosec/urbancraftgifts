import { Link } from "@tanstack/react-router";
import { ArrowRight, Quote, Star } from "lucide-react";
import { SectionHeader, FaqList } from "@/components/common/PageParts";
import { useOverlays } from "@/components/providers/OverlayProvider";
import { Button } from "@/components/ui/button";
import { BUSINESS } from "@/config/business";
import { LOGO_ASSETS } from "@/config/brand";
import { FAQS, SERVICES, TESTIMONIALS, WHY_US, type Testimonial } from "@/config/content";
import { ReviewCarousel } from "./ReviewCarousel";

import { cn } from "@/lib/utils";

export function ServicesGrid({ compact }: { compact?: boolean }) {
  const { openInquiry } = useOverlays();
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {SERVICES.map(({ id, title, summary, icon: Icon }, index) => {
        const isOlive = index % 2 === 0;
        return (
          <li
            key={id}
            className={cn(
              "flex flex-col rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 shadow-soft",
              isOlive
                ? "bg-olive text-white border border-olive-deep"
                : "bg-brown text-white border border-[#52371D]",
            )}
          >
            <div
              className={cn(
                "flex size-12 items-center justify-center rounded-2xl",
                isOlive ? "bg-white/12 text-gold" : "bg-white/12 text-sand",
              )}
            >
              <Icon className="size-6" strokeWidth={1.75} />
            </div>
            <h3 className="mt-4 font-display text-base font-bold text-white leading-snug">
              {title}
            </h3>
            <p
              className={cn(
                "mt-2.5 flex-1 text-sm leading-relaxed",
                isOlive ? "text-[#E3DED4]" : "text-[#F5ECE1]",
              )}
            >
              {summary}
            </p>
            <button
              type="button"
              onClick={() =>
                openInquiry({
                  intent:
                    id === "onboarding-kits"
                      ? "onboarding"
                      : id === "event-gifting"
                        ? "event"
                        : undefined,
                })
              }
              className={cn(
                "mt-5 inline-flex items-center gap-1.5 self-start text-sm font-semibold transition-colors underline-offset-4 hover:underline cursor-pointer",
                isOlive ? "text-gold hover:text-white" : "text-sand hover:text-white",
              )}
            >
              {compact ? "Enquire" : "Discuss this"} <ArrowRight className="size-4" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function ServicesSection() {
  return (
    <section className="bg-paper section-y" aria-labelledby="services">
      <div className="container-site">
        <SectionHeader
          id="services"
          eyebrow="Services"
          title="How we help"
          action={
            <Button asChild variant="outline">
              <Link to="/services">
                All services <ArrowRight />
              </Link>
            </Button>
          }
        />
        <ServicesGrid compact />
      </div>
    </section>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <figure className="flex h-full flex-col rounded-3xl border border-border bg-card p-6">
      <Quote className="size-6 text-gold" />
      {t.rating && (
        <div
          role="img"
          className="mt-3 flex gap-0.5 text-gold"
          aria-label={`${t.rating} out of 5 stars on Google`}
        >
          {Array.from({ length: t.rating }, (_, i) => (
            <Star key={i} className="size-4 fill-current" />
          ))}
        </div>
      )}
      <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-slate">{t.quote}</blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-sand text-sm font-semibold text-olive">
          {initials(t.name)}
        </span>
        <span>
          <span className="block text-sm font-semibold text-olive">{t.name}</span>
          {t.role && <span className="text-xs text-muted-foreground">{t.role}</span>}
        </span>
      </figcaption>
    </figure>
  );
}

export function TestimonialsBlock() {
  if (!TESTIMONIALS.length) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-border bg-card px-6 py-12 text-center">
        <img src={LOGO_ASSETS.monogram.src} alt="" className="h-16 w-16 object-contain" />
        <p className="mt-4 max-w-md text-sm text-slate">
          Client reviews from Google will appear here. In the meantime, we're happy to share
          references for work similar to yours when you enquire.
        </p>
        {BUSINESS.googleReviewUrl && (
          <Button asChild variant="outline" className="mt-6">
            <a href={BUSINESS.googleReviewUrl} target="_blank" rel="noopener noreferrer">
              Review us on Google
            </a>
          </Button>
        )}
      </div>
    );
  }
  return <ReviewCarousel />;
}

export function TestimonialsSection() {
  return (
    <section className="container-site section-y" aria-labelledby="reviews">
      <SectionHeader
        id="reviews"
        eyebrow="Client words"
        title="What clients say"
        action={
          <Button asChild variant="outline">
            <Link to="/testimonials">
              All testimonials <ArrowRight />
            </Link>
          </Button>
        }
      />
      <TestimonialsBlock />
    </section>
  );
}

export function WhyUsSection() {
  return (
    <section className="bg-olive-deep section-y text-primary-foreground" aria-labelledby="why">
      <div className="container-site grid gap-12 lg:grid-cols-[0.9fr_1.4fr]">
        <div>
          <p className="eyebrow text-gold">Why Urban Craft & Co.</p>
          <h2 id="why" className="mt-2 font-display text-[1.8rem] leading-tight md:text-[2.2rem]">
            Practical reasons teams work with us
          </h2>
          <img
            src={LOGO_ASSETS.goldStacked.src}
            alt=""
            className="mt-10 hidden h-36 w-auto object-contain opacity-90 lg:block"
          />
        </div>
        <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {WHY_US.map(({ title, body, icon: Icon }) => (
            <li key={title} className="border-t border-primary-foreground/15 pt-5">
              <Icon className="size-6 text-gold" strokeWidth={1.5} />
              <h3 className="mt-4 font-sans text-base font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-primary-foreground/70">{body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function FaqPreview() {
  return (
    <section
      className="container-site section-y grid gap-10 lg:grid-cols-[0.8fr_1.4fr]"
      aria-labelledby="faq"
    >
      <div>
        <SectionHeader
          id="faq"
          eyebrow="FAQs"
          title="Questions we hear often"
          body="Short answers to the things most buyers ask before an enquiry."
        />
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline" size="lg">
            <Link to="/faqs">
              All FAQs <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="brown" size="lg">
            <Link to="/contact">
              Contact us <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
      <FaqList items={FAQS.slice(0, 6)} />
    </section>
  );
}
