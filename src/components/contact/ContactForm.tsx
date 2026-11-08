import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Send, AlertCircle, MessageSquare, Copy, CheckCheck } from "lucide-react";
import {
  contactFormSchema,
  submitContactForm,
  QUANTITY_RANGES,
  getTodayISTDateString,
  type ContactFormData,
} from "@/lib/inquiry-service";
import { BUSINESS } from "@/config/business";
import { WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TurnstileWidget } from "@/components/common/TurnstileWidget";
import { MarkLoader } from "@/components/brand/Logo";
import { whatsappUrl } from "@/lib/whatsapp";

const PURPOSE_OPTIONS = [
  { value: "corporate-gifting", label: "Corporate Gifting" },
  { value: "onboarding", label: "Employee Onboarding & Welcome Kits" },
  { value: "client-partner", label: "Client & Partner Appreciation" },
  { value: "events", label: "Conferences, Summits & Events" },
  { value: "festive", label: "Festive & Diwali Gifting" },
  { value: "custom-branding", label: "Custom Logo Merchandise / Uniforms" },
  { value: "general", label: "General Enquiry" },
] as const;

export function ContactForm({ className = "" }: { className?: string }) {
  const [renderedAt, setRenderedAt] = useState<number>(0);
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [leadId, setLeadId] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    setRenderedAt(Date.now());
  }, []);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      purpose: "corporate-gifting",
      quantity: "",
      date: "",
      message: "",
      hp_website: "",
    },
    mode: "onTouched",
  });

  const values = watch();

  const onSubmit = async (data: ContactFormData) => {
    setStatus("submitting");
    setErrorMessage("");

    const payload: ContactFormData = {
      ...data,
      turnstileToken: turnstileToken || (import.meta.env.DEV ? "1x00000000000000000000AA" : ""),
      _renderedAt: renderedAt,
    };

    const res = await submitContactForm(payload);

    if (res.ok) {
      setLeadId(res.id || `UC-${Date.now().toString().slice(-6)}`);
      setStatus("success");
      reset();
    } else {
      setErrorMessage(res.error || "Submission failed. Please try again or reach out on WhatsApp.");
      setStatus("error");
    }
  };

  const copyRefId = () => {
    if (!leadId) return;
    navigator.clipboard.writeText(leadId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const waFollowUpText = `Hi Urban Craft & Co., I just submitted an enquiry on your website${leadId ? ` (Ref: ${leadId})` : ""}. I'd love to follow up regarding corporate gifts for ${values.name || "our company"}.`;
  const waHref = `https://wa.me/${BUSINESS.whatsappNumber}?text=${encodeURIComponent(waFollowUpText)}`;

  if (status === "success") {
    return (
      <div
        className={`rounded-3xl border border-border bg-card p-8 md:p-12 text-center shadow-soft ${className}`}
      >
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-sand text-olive">
          <Check className="size-8" />
        </div>
        <p className="eyebrow mt-5 text-brown">Enquiry Received</p>
        <h3 className="mt-2 font-display text-2xl text-olive md:text-3xl">
          Thank you! We're on it.
        </h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate">
          Your enquiry has been dispatched to our corporate gifting desk. A specialist will review
          your brief and reach out to you within 2–4 business hours.
        </p>

        {leadId && (
          <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-xl border border-border bg-muted/60 px-4 py-2 text-xs">
            <span className="text-muted-foreground">Reference ID:</span>
            <code className="font-semibold text-olive">{leadId}</code>
            <button
              type="button"
              onClick={copyRefId}
              className="ml-1 text-muted-foreground hover:text-olive transition-colors"
              title="Copy Reference ID"
            >
              {copied ? (
                <CheckCheck className="size-3.5 text-emerald-600" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </button>
          </div>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" variant="whatsapp">
            <a href={waHref} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon /> Connect on WhatsApp
            </a>
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              setStatus("idle");
              setLeadId("");
            }}
          >
            Submit Another Request
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-3xl border border-border bg-card p-6 md:p-10 shadow-soft ${className}`}
    >
      <div className="mb-6">
        <p className="eyebrow text-brown">Direct Message</p>
        <h3 className="mt-1 font-display text-2xl text-olive md:text-3xl">
          Share your gifting brief
        </h3>
        <p className="mt-2 text-sm text-slate">
          Tell us about your team size, budget, or preferred items. We will prepare custom curation
          and volume-tiered pricing.
        </p>
      </div>

      {status === "error" && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="size-5 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="font-medium">{errorMessage}</p>
            <p className="text-xs text-muted-foreground">
              You can also contact us directly on WhatsApp for an immediate response:
            </p>
            <Button size="sm" variant="whatsapp" asChild className="mt-1">
              <a href={whatsappUrl({ kind: "general" })} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="size-4" /> Chat on WhatsApp
              </a>
            </Button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-5"
        toolname="submit_corporate_inquiry"
        tooldescription="Submit corporate gifting requirements and request a personalized catalog quote"
      >
        {/* Anti-bot Honeypots (hidden from humans) */}
        <div style={{ display: "none" }} aria-hidden="true">
          <label htmlFor="uc-hp-website">Website</label>
          <input
            id="uc-hp-website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...register("hp_website")}
          />
        </div>

        {/* Row 1: Name and Company */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="contact-name">
              Your Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="contact-name"
              placeholder="e.g. Priya Sharma"
              autoComplete="name"
              className="mt-1.5 h-11"
              toolparamdescription="Full name of the contact person"
              aria-invalid={Boolean(errors.name)}
              {...register("name")}
            />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="contact-company">
              Company / Organization{" "}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input
              id="contact-company"
              placeholder="e.g. Microsoft India"
              autoComplete="organization"
              className="mt-1.5 h-11"
              toolparamdescription="Name of your enterprise, startup, or organization"
              {...register("company")}
            />
          </div>
        </div>

        {/* Row 2: Email and Phone */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="contact-email">
              Work Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="contact-email"
              type="email"
              placeholder="priya@company.com"
              autoComplete="email"
              className="mt-1.5 h-11"
              toolparamdescription="Corporate email address for receiving quote PDF and mockups"
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="contact-phone">
              Phone / WhatsApp Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="contact-phone"
              type="tel"
              placeholder="+91 98765 43210"
              autoComplete="tel"
              className="mt-1.5 h-11"
              toolparamdescription="Phone or WhatsApp number for fast turnaround and preview coordination"
              aria-invalid={Boolean(errors.phone)}
              {...register("phone")}
            />
            {errors.phone && (
              <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>
            )}
          </div>
        </div>

        {/* Row 3: Purpose, Quantity and Target Delivery Date */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="contact-purpose">Gifting Requirement</Label>
            <select
              id="contact-purpose"
              className="mt-1.5 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              toolparamdescription="Gifting requirement purpose"
              {...register("purpose")}
            >
              {PURPOSE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="contact-qty">Estimated Quantity</Label>
            <select
              id="contact-qty"
              className="mt-1.5 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              toolparamdescription="Estimated order volume / number of gift boxes needed"
              {...register("quantity")}
            >
              <option value="">Not sure yet</option>
              {QUANTITY_RANGES.map((q) => (
                <option key={q} value={q}>
                  {q} units
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="contact-date">
              Needed by <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input
              id="contact-date"
              type="date"
              min={getTodayISTDateString()}
              className="mt-1.5 h-11"
              toolparamdescription="Target delivery deadline or event date (cannot be in the past)"
              aria-invalid={Boolean(errors.date)}
              {...register("date")}
            />
            {errors.date && <p className="mt-1 text-xs text-destructive">{errors.date.message}</p>}
          </div>
        </div>

        {/* Row 4: Message */}
        <div>
          <Label htmlFor="contact-message">
            Tell us about your project or questions <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="contact-message"
            rows={4}
            placeholder="e.g. We are planning onboarding kits for 150 new hires in January with our logo on the water bottle and notebook. Please share options and timeline."
            className="mt-1.5 min-h-28 text-sm"
            aria-invalid={Boolean(errors.message)}
            {...register("message")}
          />
          {errors.message && (
            <p className="mt-1 text-xs text-destructive">{errors.message.message}</p>
          )}
        </div>

        {/* Security: Cloudflare Turnstile */}
        <div className="pt-1">
          <TurnstileWidget
            onVerify={(token) => setTurnstileToken(token)}
            onExpire={() => setTurnstileToken("")}
          />
        </div>

        {/* Submit Actions */}
        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
          <Button
            type="submit"
            size="lg"
            className="w-full sm:w-auto min-w-[190px]"
            disabled={status === "submitting"}
          >
            {status === "submitting" ? (
              <>
                <MarkLoader className="size-4 animate-spin mr-2" /> Sending Enquiry...
              </>
            ) : (
              <>
                <Send className="size-4 mr-2" /> Send Enquiry
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="lg"
            asChild
            className="w-full sm:w-auto text-muted-foreground hover:text-olive"
          >
            <a href={whatsappUrl({ kind: "general" })} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon className="mr-2" /> Prefer WhatsApp? Chat with us
            </a>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Your information is kept strictly confidential. We never spam or share your contact
          details.
        </p>
      </form>
    </div>
  );
}
