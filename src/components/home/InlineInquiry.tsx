import { useState, useEffect, type FormEvent } from "react";
import { Mail, Phone, MapPin, Clock, Check, Send } from "lucide-react";
import { whatsappUrl } from "@/lib/whatsapp";
import { WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BUSINESS } from "@/config/business";
import { QUANTITY_RANGES, submitContactForm } from "@/lib/inquiry-service";
import { Reveal } from "@/components/common/Reveal";
import { MarkLoader } from "@/components/brand/Logo";
import { TurnstileWidget } from "@/components/common/TurnstileWidget";

/**
 * Inline enquiry form. Connects directly to the server API and also
 * provides instantaneous WhatsApp follow-up.
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
  const [hpWebsite, setHpWebsite] = useState("");
  const [renderedAt, setRenderedAt] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [leadId, setLeadId] = useState("");

  useEffect(() => {
    setRenderedAt(Date.now());
  }, []);

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

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;

    setStatus("submitting");

    // Determine if contact is email or phone
    const isEmail = contact.includes("@");
    const payload = {
      name: name.trim(),
      email: isEmail ? contact.trim() : "not-provided@urbancraftgifts.com",
      phone: !isEmail ? contact.trim() : "+919266129456",
      quantity,
      message: message.trim(),
      purpose: "Quick Website Enquiry",
      hp_website: hpWebsite,
      turnstileToken: turnstileToken || (import.meta.env.DEV ? "1x00000000000000000000AA" : ""),
      _renderedAt: renderedAt,
    };

    const res = await submitContactForm(payload);

    if (res.ok) {
      setLeadId(res.id || "");
      setStatus("success");
    } else {
      setStatus("error");
    }
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
          {status === "success" ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-sand/30 p-8 text-center">
              <span className="inline-flex size-14 items-center justify-center rounded-full bg-sand text-olive">
                <Check className="size-7" />
              </span>
              <h3 className="mt-4 font-display text-xl text-olive">Thank you! Enquiry received.</h3>
              <p className="mt-2 max-w-sm text-sm text-slate">
                We have received your details{leadId ? ` (Ref: ${leadId})` : ""}. A gifting
                specialist will get in touch shortly.
              </p>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <Button asChild variant="whatsapp" size="lg">
                  <a href={waHref} target="_blank" rel="noopener noreferrer">
                    <WhatsAppIcon /> Also connect on WhatsApp
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setStatus("idle");
                    setName("");
                    setContact("");
                    setMessage("");
                  }}
                >
                  Send another
                </Button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={submit}
              noValidate
              className="grid gap-5"
              toolname="quick_corporate_inquiry"
              tooldescription="Submit a quick initial corporate inquiry to Urban Craft & Co."
            >
              {/* Anti-bot Honeypot */}
              <div style={{ display: "none" }} aria-hidden="true">
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={hpWebsite}
                  onChange={(e) => setHpWebsite(e.target.value)}
                />
              </div>

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
                    toolparamdescription="Your full name or corporate contact person"
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
                    toolparamdescription="Your corporate email or phone / WhatsApp number"
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
                  toolparamdescription="Approximate order quantity range"
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
                  toolparamdescription="Brief description of gifting requirements, logo customization, or timeline"
                />
              </div>
              <div className="pt-1">
                <TurnstileWidget
                  siteKey="0x4AAAAAAF4N2BizrqzpRRny"
                  onVerify={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken("")}
                  onError={(err) => console.warn("Turnstile widget error:", err)}
                />
              </div>

              {touched && !valid && (
                <p className="text-xs text-destructive" role="alert">
                  Please add your name, a way to reach you, and a line about what you need.
                </p>
              )}
              {status === "error" && (
                <p className="text-xs text-destructive" role="alert">
                  Could not submit online. Please complete the security check above or click
                  WhatsApp or Email below to send directly.
                </p>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={status === "submitting"}
                >
                  {status === "submitting" ? (
                    <>
                      <MarkLoader className="mr-2 size-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 size-4" /> Submit Enquiry
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  size="lg"
                  variant="whatsapp"
                  className="w-full"
                  onClick={() => {
                    setTouched(true);
                    if (valid) window.open(waHref, "_blank", "noopener,noreferrer");
                  }}
                >
                  <WhatsAppIcon /> Send on WhatsApp
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Your enquiry is securely sent to our New Delhi gifting team. You can also chat
                directly on WhatsApp.
              </p>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
