import { WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import { Link } from "@tanstack/react-router";
import { Mail, Phone } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Logo } from "@/components/brand/Logo";
import { CATEGORY_GROUPS, categoriesInGroup } from "@/config/categories";
import { PRIMARY_NAV } from "@/config/navigation";
import { BUSINESS } from "@/config/business";
import { whatsappUrl } from "@/lib/whatsapp";

export function MobileNavDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const close = () => onOpenChange(false);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="flex w-[88vw] max-w-sm flex-col gap-0 overflow-y-auto bg-background p-0"
      >
        <div className="flex justify-center border-b border-border py-6">
          <Logo variant="compactStacked" height={84} />
        </div>
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <SheetDescription className="sr-only">
          Site navigation and product categories
        </SheetDescription>
        <nav aria-label="Mobile" className="flex-1 px-5 py-4">
          <p className="eyebrow mb-1 text-brown">Shop by category</p>
          <Accordion type="single" collapsible>
            {CATEGORY_GROUPS.map((g) => (
              <AccordionItem key={g.id} value={g.id}>
                <AccordionTrigger className="py-3.5 text-[0.95rem] font-semibold text-olive">
                  {g.label}
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-0.5 pb-1">
                    {categoriesInGroup(g.id).map((c) => (
                      <li key={c.slug}>
                        <Link
                          to="/categories/$slug"
                          params={{ slug: c.slug }}
                          onClick={close}
                          className="block rounded-lg px-2 py-2.5 text-sm text-charcoal hover:bg-muted"
                        >
                          {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <ul className="mt-5 space-y-0.5">
            {[
              { to: "/", label: "Home" },
              { to: "/categories", label: "All Categories" },
              ...PRIMARY_NAV,
              { to: "/favorites", label: "Favourites" },
            ].map((n) => (
              <li key={n.to}>
                <Link
                  to={n.to}
                  onClick={close}
                  className="block rounded-lg px-2 py-3 text-[0.95rem] font-medium text-charcoal hover:bg-muted"
                  activeProps={{ className: "text-olive font-semibold" }}
                  activeOptions={{ exact: true }}
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-2 border-t border-border bg-sand/40 px-5 py-5 pb-safe text-sm">
          <a
            href={whatsappUrl({ kind: "general" })}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 py-1.5 text-olive"
          >
            <WhatsAppIcon className="size-4" /> WhatsApp us
          </a>
          <a
            href={`tel:${BUSINESS.phoneE164}`}
            className="flex items-center gap-2 py-1.5 text-olive"
          >
            <Phone className="size-4" /> {BUSINESS.phoneDisplay}
          </a>
          <a
            href={`mailto:${BUSINESS.email}`}
            className="flex items-center gap-2 py-1.5 text-olive"
          >
            <Mail className="size-4" /> {BUSINESS.email}
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}
