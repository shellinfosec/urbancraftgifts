import { WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Send } from "lucide-react";
import { ContactCTA, SectionHeader } from "@/components/common/PageParts";
import { EditorialHero } from "@/components/common/EditorialHero";
import { Reveal } from "@/components/common/Reveal";
import { ProcessStory } from "@/components/home/HomeMerch";
import { InlineInquiry } from "@/components/home/InlineInquiry";
import { useOverlays } from "@/components/providers/OverlayProvider";
import { Button } from "@/components/ui/button";
import { CATEGORY_MAP } from "@/config/categories";
import { SERVICES } from "@/config/content";
import { whatsappUrl } from "@/lib/whatsapp";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/services")({
  head: () =>
    pageHead({
      title: "Corporate Gifting Services",
      description:
        "Corporate gifting, onboarding kits, event gifting, custom logo branding and bulk-order coordination from Urban Craft & Co.",
      path: "/services",
    }),
  component: ServicesPage,
});

function ServicesPage() {
  const { openInquiry } = useOverlays();
  return (
    <>
      <EditorialHero page="services" />
      <ol className="container-site grid gap-5 pb-14 md:grid-cols-2">
        {SERVICES.map(({ id, title, detail, icon: Icon, categories }, i) => (
          <Reveal as="li" key={id} delay={(i % 2) * 0.08} className="flex">
            <article
              id={id}
              className="group relative flex w-full scroll-mt-28 flex-col overflow-hidden rounded-3xl border border-border bg-card p-6 card-hover md:p-8"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute -right-4 -top-6 font-display text-[6rem] leading-none text-sand/70 transition-colors duration-500 group-hover:text-gold/40"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-sand text-olive transition-colors duration-500 group-hover:bg-olive group-hover:text-primary-foreground">
                <Icon className="size-6" strokeWidth={1.5} />
              </span>
              <h2 className="mt-5 font-display text-xl text-olive md:text-2xl">{title}</h2>
              <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-slate">{detail}</p>
              <p className="mt-4 flex flex-wrap gap-2 text-xs">
                {categories.map((s) => (
                  <Link
                    key={s}
                    to="/categories/$slug"
                    params={{ slug: s }}
                    className="rounded-full border border-border px-3 py-1.5 transition-colors hover:border-olive hover:bg-muted"
                  >
                    {CATEGORY_MAP[s]?.shortName}
                  </Link>
                ))}
              </p>
              <div className="mt-6 flex flex-wrap gap-2 pt-2">
                <Button
                  onClick={() =>
                    openInquiry({
                      intent:
                        id === "onboarding-kits"
                          ? "onboarding"
                          : id === "event-gifting"
                            ? "event"
                            : undefined,
                      categories,
                    })
                  }
                >
                  <Send /> Enquire
                </Button>
                <Button asChild variant="whatsapp">
                  <a
                    href={whatsappUrl({ kind: "service", service: title })}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <WhatsAppIcon /> WhatsApp
                  </a>
                </Button>
              </div>
            </article>
          </Reveal>
        ))}
      </ol>
      <section className="bg-paper section-y" aria-labelledby="services-next">
        <div className="container-site">
          <SectionHeader
            id="services-next"
            eyebrow="Not sure where to start?"
            title="Start with a category, or just describe the occasion"
            body="Most enquiries begin with a rough idea. Browse the catalogue, save favourites, or send us a line - we'll suggest a shortlist."
            action={
              <Button asChild variant="outline">
                <Link to="/products">
                  Browse all products <ArrowRight />
                </Link>
              </Button>
            }
          />
        </div>
      </section>
      <ProcessStory />
      <InlineInquiry
        id="services-enquiry"
        heading="Describe your requirement"
        intro="One message is enough to get a shortlist and a quote started."
      />
      <ContactCTA />
    </>
  );
}
