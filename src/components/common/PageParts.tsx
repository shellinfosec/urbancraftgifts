import { WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Send } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useOverlays, type InquiryPrefill } from "@/components/providers/OverlayProvider";
import { LOGO_ASSETS } from "@/config/brand";
import type { Faq } from "@/config/content";
import { whatsappUrl, type WhatsAppContext } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { BrandImage } from "./BrandImage";

export interface Crumb {
  label: string;
  to?: string;
  params?: Record<string, string> | undefined;
}

export function Breadcrumbs({
  items,
  tone = "light",
}: {
  items: Crumb[];
  tone?: "light" | "dark";
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "text-xs",
        tone === "dark" ? "text-primary-foreground/75" : "text-muted-foreground",
      )}
    >
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link to="/" className={tone === "dark" ? "hover:text-gold" : "hover:text-olive"}>
            Home
          </Link>
        </li>
        {items.map((c) => (
          <li key={c.label} className="flex items-center gap-1.5">
            <ChevronRight className="size-3" aria-hidden />
            {c.to ? (
              <Link to={c.to} params={c.params ?? {}} className="hover:text-olive">
                {c.label}
              </Link>
            ) : (
              <span
                aria-current="page"
                className={tone === "dark" ? "text-primary-foreground" : "text-charcoal"}
              >
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHeader({
  crumbs,
  eyebrow,
  title,
  intro,
  children,
  className,
}: {
  crumbs: Crumb[];
  eyebrow?: string;
  title: string;
  intro?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("container-site pb-6 pt-6 md:pb-8 md:pt-8", className)}>
      <Breadcrumbs items={crumbs} />
      <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          {eyebrow && <p className="eyebrow text-brown">{eyebrow}</p>}
          <h1 className="mt-2 font-display text-3xl leading-tight text-olive md:text-[2.5rem]">
            {title}
          </h1>
          {intro && <p className="mt-3 text-[0.95rem] leading-relaxed text-slate">{intro}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  body,
  action,
  tone = "light",
  align = "left",
  id,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  action?: ReactNode;
  tone?: "light" | "dark";
  align?: "left" | "center";
  id?: string;
}) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between",
        align === "center" && "items-center text-center md:flex-col md:items-center",
      )}
    >
      <Reveal className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && (
          <p className={cn("eyebrow", tone === "dark" ? "text-gold" : "text-brown")}>{eyebrow}</p>
        )}
        <h2
          id={id}
          className={cn(
            "mt-2 font-display text-[1.65rem] leading-tight md:text-[2.1rem]",
            tone === "dark" ? "text-primary-foreground" : "text-olive",
          )}
        >
          {title}
        </h2>
        {body && (
          <p
            className={cn(
              "mt-3 text-[0.95rem] leading-relaxed",
              tone === "dark" ? "text-primary-foreground/75" : "text-slate",
            )}
          >
            {body}
          </p>
        )}
      </Reveal>
      {action}
    </div>
  );
}

/** Supplied 2.5:1 category banner - shown whole, never cropped or overlaid. */
export function CategoryBanner({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="container-site">
      <div className="relative aspect-[5/2] overflow-hidden rounded-2xl bg-sand md:rounded-3xl">
        <BrandImage
          src={src}
          alt={alt}
          className="h-full w-full object-contain"
          loading="eager"
          fetchPriority="high"
          width={1500}
          height={600}
        />
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-card px-6 py-14 text-center">
      <img src={LOGO_ASSETS.outline.src} alt="" className="h-14 w-14 object-contain opacity-60" />
      <h2 className="mt-4 font-display text-xl text-olive">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-slate">{body}</p>
      {action && <div className="mt-6 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}

export function ContactCTA({
  title = "Planning gifts for your team, clients or event?",
  body = "Share what you have in mind - quantity, timing, branding - and we'll suggest options from the catalogue.",
  prefill,
  whatsapp = { kind: "general" },
}: {
  title?: string;
  body?: string;
  prefill?: InquiryPrefill;
  whatsapp?: WhatsAppContext;
}) {
  const { openInquiry } = useOverlays();
  return (
    <section className="container-site py-14 md:py-20" aria-labelledby="cta-title">
      <div className="relative overflow-hidden rounded-3xl bg-brown px-6 py-12 text-primary-foreground md:px-14 md:py-16">
        <img
          src={LOGO_ASSETS.outline.src}
          alt=""
          aria-hidden
          className="pointer-events-none absolute -bottom-10 -right-10 w-72 opacity-10 invert"
        />
        <div className="relative max-w-2xl">
          <h2 id="cta-title" className="font-display text-2xl leading-snug md:text-[2rem]">
            {title}
          </h2>
          <p className="mt-3 text-primary-foreground/80">{body}</p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" variant="ivory" onClick={() => openInquiry(prefill)}>
              <Send /> Start an enquiry
            </Button>
            <Button size="lg" variant="outline-light" asChild>
              <a href={whatsappUrl(whatsapp)} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="" /> WhatsApp us
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FaqList({ items }: { items: Faq[] }) {
  return (
    <Accordion
      type="single"
      collapsible
      className="divide-y divide-border rounded-2xl border border-border bg-card px-5 md:px-7"
    >
      {items.map((f, i) => (
        <AccordionItem key={f.q} value={`f${i}`} className="border-0">
          <AccordionTrigger className="py-5 text-left text-[0.95rem] font-semibold text-olive hover:no-underline">
            {f.q}
          </AccordionTrigger>
          <AccordionContent className="pb-5 text-sm leading-relaxed text-slate">
            {f.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="container-site max-w-3xl space-y-5 pb-20 text-[0.95rem] leading-relaxed text-slate [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-xl [&_h2]:text-olive">
      {children}
    </div>
  );
}
