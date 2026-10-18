import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { ContactCTA, SectionHeader } from "@/components/common/PageParts";
import { EditorialHero } from "@/components/common/EditorialHero";
import { Reveal } from "@/components/common/Reveal";
import { Logo } from "@/components/brand/Logo";
import { WhyUsSection } from "@/components/home/HomeTrust";
import { ProcessStory } from "@/components/home/HomeMerch";
import { Button } from "@/components/ui/button";
import { BUSINESS } from "@/config/business";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () =>
    pageHead({
      title: "About Us",
      description:
        "Urban Craft & Co. is a New Delhi corporate gifting studio offering gift sets, welcome kits, bags and drinkware with logo customization.",
      path: "/about",
    }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <EditorialHero page="about" />
      <section className="container-site grid gap-10 pb-16 md:grid-cols-[1fr_1.3fr] md:items-center">
        <Reveal className="flex justify-center rounded-3xl bg-olive p-10">
          <Logo variant="horizontalReversed" height={80} className="max-w-full" />
        </Reveal>
        <Reveal delay={0.1} className="space-y-4 text-[0.98rem] leading-relaxed text-slate">
          <p>
            {BUSINESS.name} helps companies choose and brand gifts for employees, clients and
            events. We work from {BUSINESS.address.city}, and our catalogue includes boxed gift
            sets, laptop bags, backpacks, duffles, jute and felt bags, drinkware, conference folders
            and employee welcome kits.
          </p>
          <p>
            Most of our clients come to us with a rough idea: a number of people, an occasion and a
            date. We help turn that into a specific selection, confirm which branding method works
            for each product, and coordinate the order from there.
          </p>
          <p>
            Our approach is simple - show real products clearly, avoid surprises, and keep one point
            of contact through the process.
          </p>
        </Reveal>
      </section>

      <section className="container-site section-y" aria-labelledby="about-how">
        <SectionHeader
          id="about-how"
          eyebrow="How we work"
          title="One contact, from shortlist to dispatch"
          body="You browse and shortlist; we confirm branding, quantities and packing, and keep you posted until the order is delivered."
        />
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/products">
              Browse the catalogue <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/services">See our services</Link>
          </Button>
        </div>
      </section>

      <ProcessStory />
      <WhyUsSection />
      <ContactCTA />
    </>
  );
}
