import { WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Mail, MapPin, Phone, Navigation } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { BUSINESS } from "@/config/business";
import { CATEGORY_GROUPS, categoriesInGroup } from "@/config/categories";
import { COMPANY_LINKS, LEGAL_LINKS } from "@/config/navigation";
import { useOverlays } from "@/components/providers/OverlayProvider";
import { whatsappUrl } from "@/lib/whatsapp";

export function SiteFooter() {
  const { openInquiry } = useOverlays();
  return (
    <footer className="overflow-hidden bg-olive text-primary-foreground/80">
      <div className="container-site pb-28 pt-12 md:pb-10 md:pt-16">
        <div className="grid gap-10 border-b border-primary-foreground/15 pb-10 lg:grid-cols-[1fr_1.8fr] lg:gap-16">
          <div className="mx-auto w-full text-center md:mx-0 md:text-left">
            <Logo
              variant="horizontalReversed"
              className="mx-auto h-[112px] w-auto max-w-full md:mx-0 md:h-[120px] lg:h-auto lg:w-full"
            />
            <p className="mt-6 text-sm leading-relaxed">
              Corporate gift sets, welcome kits, bags and drinkware - chosen with you and branded
              for your team, clients and events.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row md:justify-start">
              <Button variant="ivory" onClick={() => openInquiry()}>
                Start an enquiry <ArrowRight className="size-4" />
              </Button>
              <Button asChild variant="outline-light">
                <a
                  href={whatsappUrl({ kind: "general" })}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <WhatsAppIcon className="size-4" /> WhatsApp
                </a>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3">
            <div className="col-span-2 grid grid-cols-2 gap-x-5 gap-y-8">
              {CATEGORY_GROUPS.map((g) => (
                <div key={g.id}>
                  <h2 className="eyebrow font-sans text-gold">{g.label}</h2>
                  <ul className="mt-3 space-y-2 text-sm">
                    {categoriesInGroup(g.id).map((c) => (
                      <li key={c.slug}>
                        <Link
                          to="/categories/$slug"
                          params={{ slug: c.slug }}
                          className="inline-block py-1 leading-relaxed hover:text-primary-foreground hover:underline underline-offset-4"
                        >
                          {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div>
                <h2 className="eyebrow font-sans text-gold">Company</h2>
                <ul className="mt-3 space-y-2 text-sm">
                  {COMPANY_LINKS.map((l) => (
                    <li key={l.to}>
                      <Link
                        to={l.to}
                        className="inline-block py-1 hover:text-primary-foreground hover:underline underline-offset-4"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-8 py-10 md:grid-cols-2 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <address className="min-w-0 space-y-3 text-sm not-italic">
            <h2 className="eyebrow mb-5 font-sans text-gold">Visit or reach us</h2>
            <p className="flex gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              {BUSINESS.addressLine}
            </p>
            <p className="flex gap-2">
              <Clock className="mt-0.5 size-4 shrink-0" />
              {BUSINESS.hours}
            </p>
            <a
              href={`tel:${BUSINESS.phoneE164}`}
              className="flex gap-2 hover:text-primary-foreground"
            >
              <Phone className="mt-0.5 size-4 shrink-0" />
              {BUSINESS.phoneDisplay}
            </a>
            <a
              href={`mailto:${BUSINESS.email}`}
              className="flex gap-2 break-all hover:text-primary-foreground"
            >
              <Mail className="mt-0.5 size-4 shrink-0" />
              {BUSINESS.email}
            </a>
            <a
              href={whatsappUrl({ kind: "general" })}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-2 hover:text-primary-foreground"
            >
              <WhatsAppIcon className="mt-0.5 size-4 shrink-0" />
              Chat on WhatsApp
            </a>
          </address>
          <div className="min-w-0">
            <div className="aspect-[2/1] overflow-hidden rounded-lg bg-stage-stone">
              <iframe
                src={BUSINESS.mapEmbedUrl}
                title={`${BUSINESS.name} location in ${BUSINESS.address.city}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full border-0"
              />
            </div>
            <a
              href={BUSINESS.mapLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary-foreground hover:underline"
            >
              <Navigation className="size-4" /> Get directions <ArrowRight className="size-4" />
            </a>
          </div>
        </div>
        <div className="flex flex-col gap-4 border-t border-primary-foreground/15 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {BUSINESS.name} All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {LEGAL_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-primary-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
