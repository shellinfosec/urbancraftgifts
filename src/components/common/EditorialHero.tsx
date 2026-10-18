import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandImage } from "./BrandImage";
import { Breadcrumbs } from "./PageParts";
import { WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import { PAGE_INTROS } from "@/config/page-intros";
import { whatsappUrl } from "@/lib/whatsapp";
import { useOverlays } from "@/components/providers/OverlayProvider";

export function EditorialHero({ page }: { page: keyof typeof PAGE_INTROS }) {
  const intro = PAGE_INTROS[page];
  const { openInquiry } = useOverlays();
  return (
    <>
      <section className="relative mb-12 overflow-hidden bg-olive text-primary-foreground md:mb-16">
        <div className="container-site relative grid items-center gap-6 py-9 md:min-h-[390px] md:grid-cols-[1.15fr_0.85fr] md:gap-12 md:py-12">
          <div className="relative z-10">
            <Breadcrumbs items={[{ label: intro.label }]} tone="dark" />
            <p className="eyebrow mt-6 text-gold">{intro.label}</p>
            <h1 className="mt-4 max-w-2xl font-display text-3xl leading-tight md:text-4xl lg:text-5xl">
              {intro.title}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-primary-foreground/80">
              {intro.body}
            </p>
            <div className="mt-7 grid gap-3 sm:flex sm:flex-wrap">
              {page === "about" ? (
                <Button asChild size="lg" variant="ivory">
                  <Link to="/products">
                    {intro.action}
                    <ArrowRight />
                  </Link>
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="ivory"
                  onClick={() =>
                    page === "contact"
                      ? document
                          .getElementById("contact-enquiry")
                          ?.scrollIntoView({ behavior: "smooth", block: "start" })
                      : openInquiry()
                  }
                >
                  {intro.action}
                  <ArrowRight />
                </Button>
              )}
              <Button asChild size="lg" variant="outline-light">
                <a
                  href={whatsappUrl({ kind: "general" })}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WhatsAppIcon /> WhatsApp us
                </a>
              </Button>
            </div>
          </div>
          <BrandImage
            src={intro.image}
            alt={intro.imageAlt}
            width={1024}
            height={1024}
            fetchPriority="high"
            loading="eager"
            className="mx-auto aspect-square w-full max-w-[300px] md:max-w-[440px]"
            imgClassName="object-contain"
          />
        </div>
      </section>
    </>
  );
}
