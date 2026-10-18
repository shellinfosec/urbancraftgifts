import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Star } from "lucide-react";
import { ContactCTA, PageHeader } from "@/components/common/PageParts";
import { TestimonialsBlock } from "@/components/home/HomeTrust";
import { pageHead } from "@/lib/seo";
import { BUSINESS } from "@/config/business";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/testimonials")({
  head: () =>
    pageHead({
      title: "Testimonials & Reviews",
      description:
        "Reviews from corporate clients and companies that have ordered custom branded corporate gifts from Urban Craft & Co. in New Delhi.",
      path: "/testimonials",
    }),
  component: TestimonialsPage,
});

function GoogleReviewCard() {
  return (
    <section className="container-site pb-14" aria-labelledby="google-review-heading">
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-[#FAF7F2] to-sand/40 p-8 sm:p-10 md:p-12 shadow-soft">
        {/* Subtle decorative brand glows */}
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-gold/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 -bottom-16 size-64 rounded-full bg-olive/5 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-2xl text-center">
          {/* 5 Gold Stars & Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/80 px-4 py-1.5 shadow-2xs">
            <div className="flex gap-1 text-gold" aria-hidden="true">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="size-4 fill-current" />
              ))}
            </div>
            <span className="text-xs font-semibold text-olive">5.0 Star Experience on Google</span>
          </div>

          <h2
            id="google-review-heading"
            className="mt-5 font-display text-2xl sm:text-3xl font-bold text-olive tracking-tight"
          >
            Review Us on Google
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-slate sm:text-base">
            Have you partnered with Urban Craft &amp; Co. for corporate gift sets, employee welcome
            kits, or branded event carry? Your feedback helps fellow corporate buyers choose with
            confidence and inspires our workshop team.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-xl bg-olive px-6 text-sm font-semibold text-white hover:bg-olive/90 shadow-sm gap-2"
            >
              <a href={BUSINESS.googleReviewUrl} target="_blank" rel="noopener noreferrer">
                <span>Write a Review on Google</span>
                <ExternalLink className="size-4 text-gold" />
              </a>
            </Button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Takes less than 60 seconds · Direct link to Google Local listing
          </p>
        </div>
      </div>
    </section>
  );
}

function TestimonialsPage() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: "Testimonials" }]}
        eyebrow="Testimonials"
        title="What our clients say"
      />
      <div className="container-site pb-10">
        <TestimonialsBlock />
      </div>
      <GoogleReviewCard />
      <ContactCTA />
    </>
  );
}
