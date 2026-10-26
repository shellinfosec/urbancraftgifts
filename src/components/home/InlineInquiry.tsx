import { useState, type FormEvent } from "react";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { whatsappUrl } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BUSINESS } from "@/config/business";
import { QUANTITY_RANGES } from "@/lib/inquiry-service";
import { Reveal } from "@/components/common/Reveal";

/**
 * Inline enquiry form (no popup). Sends via WhatsApp or email with the
 * details prefilled, so nothing is lost until a backend endpoint is connected.
 */
export function InlineInquiry({
  id = "quick-enquiry",
  heading = "Send a quick enquiry",
  intro = "A few lines are enough - we'll take it from there.",
}: {
  id?: string;
  heading?: string;
  intro?: string;
}) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [quantity, setQuantity] = useState("");
  const [message, setMessage] = useState("");
  const [touched, setTouched] = useState(false);

  const valid = name.trim().length >= 2 && contact.trim().length >= 5 && message.trim().length >= 5;

  const text = [
    `New enquiry from ${name.trim()}`,
    contact.trim() && `Contact: ${contact.trim()}`,
    quantity && `Approximate quantity: ${quantity}`,
    "",
    message.trim(),
  ]
    .filter((l) => l !== undefined && l !== null)
    .join("\n");

  const waHref = `https://wa.me/${BUSINESS.whatsappNumber}?text=${encodeURIComponent(text)}`;
  const mailHref = `mailto:${BUSINESS.email}?subject=${encodeURIComponent(
    `Enquiry from ${name.trim() || "website"}`,
  )}&body=${encodeURIComponent(text)}`;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    window.open(waHref, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="container-site section-y" aria-labelledby={id}>
      <div className="grid gap-7 border-y border-border bg-card py-8 md:gap-10 md:py-10 lg:grid-cols-[1fr_1.2fr] lg:gap-14">
        <Reveal>
          <p className="eyebrow text-brown">Quick enquiry</p>
          <h2
            id={id}
            className="mt-2 font-display text-[1.65rem] leading-tight text-olive md:text-[2.1rem]"
          >
            {heading}
          </h2>
          <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-slate">{intro}</p>
          <ul className="mt-7 space-y-4">
            {[
              {
                icon: Phone,
                label: "Call us",
                value: BUSINESS.phoneDisplay,
                href: `tel:${BUSINESS.phoneE164}`,
              },
              {
                icon: WhatsAppIcon,
                label: "WhatsApp",
                value: "Discuss your gifting brief",
                href: whatsappUrl({ kind: "general" }),
              },
              {
                icon: Mail,
                label: "Email",
                value: BUSINESS.email,
                href: `mailto:${BUSINESS.email}`,
              },
              {
                icon: MapPin,
                label: "Visit us",
                value: BUSINESS.addressLine,
                subvalue: `Plus code: ${BUSINESS.plusCode}`,
                href: BUSINESS.mapLinkUrl,
              },
              { icon: Clock, label: "Opening hours", value: BUSINESS.hours, href: undefined },
            ].map(({ icon: Icon, label, value, subvalue, href }) => (
              <li key={label} className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-header-category text-brown-deep">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <span className="block text-xs text-muted-foreground">{label}</span>
                  {href ? (
                    <a
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="inline-block py-1 text-sm font-medium leading-relaxed text-olive hover:underline break-words"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="py-1 text-sm leading-relaxed text-olive">{value}</p>
                  )}
                  {subvalue ? (
                    <span className="block text-xs text-muted-foreground">{subvalue}</span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={0.1}>
          <form onSubmit={submit} noValidate className="grid gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor={`${id}-name`}>Your name</Label>
                <Input
                  id={`${id}-name`}
                  autoComplete="name"
                  className="mt-2 h-12 text-base md:text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={touched && name.trim().length < 2}
                />
              </div>
              <div>
                <Label htmlFor={`${id}-contact`}>Email or phone</Label>
                <Input
                  id={`${id}-contact`}
                  autoComplete="email"
                  className="mt-2 h-12 text-base md:text-sm"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  aria-invalid={touched && contact.trim().length < 5}
                />
              </div>
            </div>
            <div>
              <Label htmlFor={`${id}-qty`}>
                Approximate quantity <span className="text-muted-foreground">(optional)</span>
              </Label>
              <select
                id={`${id}-qty`}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="mt-2 h-12 w-full rounded-md border border-input bg-background px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
              >
                <option value="">Not sure yet</option>
                {QUANTITY_RANGES.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor={`${id}-msg`}>What do you have in mind?</Label>
              <Textarea
                id={`${id}-msg`}
                rows={4}
                className="mt-2 min-h-32 text-base md:text-sm"
                placeholder="e.g. Welcome kits for 40 new joiners in March, with our logo on the bottle and notebook."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                aria-invalid={touched && message.trim().length < 5}
              />
            </div>
            {touched && !valid && (
              <p className="text-xs text-destructive" role="alert">
                Please add your name, a way to reach you, and a line about what you need.
              </p>
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              <Button type="submit" size="lg" className="w-full">
                <WhatsAppIcon /> Send on WhatsApp
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="w-full"
                disabled={!valid}
                onClick={() => {
                  setTouched(true);
                  if (valid) window.location.href = mailHref;
                }}
              >
                <Mail /> Send by email
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Opens WhatsApp with your message prefilled - nothing is sent until you press send
              there.
            </p>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
