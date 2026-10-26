import { WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { EditorialHero } from "@/components/common/EditorialHero";
import { InlineInquiry } from "@/components/home/InlineInquiry";
import { useOverlays } from "@/components/providers/OverlayProvider";
import { Button } from "@/components/ui/button";
import { BUSINESS } from "@/config/business";
import { whatsappUrl } from "@/lib/whatsapp";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () =>
    pageHead({
      title: "Contact Us",
      description: `Contact Urban Craft & Co. in Sadar Bazar, New Delhi. Call or WhatsApp ${BUSINESS.phoneDisplay} or email ${BUSINESS.email}.`,
      path: "/contact",
    }),
  component: ContactPage,
});

function ContactPage() {
  const { openInquiry } = useOverlays();
  const rows = [
    {
      icon: Phone,
      label: "Phone",
      value: BUSINESS.phoneDisplay,
      href: `tel:${BUSINESS.phoneE164}`,
    },
    {
      icon: WhatsAppIcon,
      label: "WhatsApp",
      value: BUSINESS.phoneDisplay,
      href: whatsappUrl({ kind: "general" }),
    },
    { icon: Mail, label: "Email", value: BUSINESS.email, href: `mailto:${BUSINESS.email}` },
    {
      icon: MapPin,
      label: "Address",
      value: BUSINESS.addressLine,
      subvalue: `Plus code: ${BUSINESS.plusCode}`,
      href: BUSINESS.mapLinkUrl,
    },
    { icon: Clock, label: "Hours", value: BUSINESS.hours },
  ];
  return (
    <>
      <EditorialHero page="contact" />
      <section className="container-site grid gap-8 pb-20 lg:grid-cols-[1fr_1.2fr]">
        <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
          <ul className="space-y-5">
            {rows.map(({ icon: Icon, label, value, subvalue, href }) => (
              <li key={label} className="flex gap-4">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sand text-olive">
                  <Icon className="size-5" />
                </span>
                <span>
                  <span className="block text-xs uppercase tracking-wider text-muted-foreground">
                    {label}
                  </span>
                  {href ? (
                    <a
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="break-words font-medium text-olive hover:underline"
                    >
                      {value}
                    </a>
                  ) : (
                    <span className="font-medium text-olive">{value}</span>
                  )}
                  {subvalue ? (
                    <span className="mt-1 block text-xs text-muted-foreground">{subvalue}</span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col gap-2 sm:flex-row">
            <Button size="lg" onClick={() => openInquiry()}>
              <Send /> Open enquiry form
            </Button>
            <Button size="lg" variant="whatsapp" asChild>
              <a href={whatsappUrl({ kind: "general" })} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="" /> WhatsApp
              </a>
            </Button>
          </div>
        </div>
        <div className="overflow-hidden rounded-3xl border border-border bg-muted">
          <iframe
            title={`Map: ${BUSINESS.name}`}
            src={BUSINESS.mapEmbedUrl}
            className="h-full min-h-[380px] w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
      <InlineInquiry
        id="contact-enquiry"
        heading="Write to us here"
        intro="Fill this in and it opens WhatsApp or your mail app with everything included - no account needed."
      />
    </>
  );
}
