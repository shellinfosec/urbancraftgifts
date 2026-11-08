import { z } from "zod";

export const INTENTS = [
  { value: "employee", label: "Employee gifting" },
  { value: "client", label: "Client / partner gifting" },
  { value: "onboarding", label: "Onboarding / welcome kits" },
  { value: "event", label: "Event or conference" },
  { value: "festive", label: "Festive gifting" },
  { value: "other", label: "Something else" },
] as const;

export const QUANTITY_RANGES = [
  "Under 25",
  "25–100",
  "100–250",
  "250–500",
  "500+",
  "Not sure yet",
] as const;

export function getTodayISTDateString(): string {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  } catch {
    return new Date().toISOString().substring(0, 10);
  }
}

export const inquirySchema = z.object({
  intent: z.string().min(1, "Choose what the gifts are for"),
  categories: z.array(z.string()),
  products: z.array(z.string()),
  quantity: z.string().min(1, "Choose an approximate quantity"),
  date: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === "") return true;
      return val >= getTodayISTDateString();
    }, "Target date cannot be in the past"),
  customization: z.enum(["yes", "no", "unsure"]),
  location: z.string().trim().max(120).optional(),
  name: z.string().trim().min(2, "Please enter your name").max(80),
  company: z.string().trim().max(100).optional(),
  email: z.string().trim().email("Enter a valid email address").max(160),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s-]{7,16}$/, "Enter a valid phone number"),
  notes: z.string().trim().max(1000).optional(),
  // Security honeypot & turnstile
  turnstileToken: z.string().optional(),
  hp_website: z.string().optional(),
  _renderedAt: z.number().optional(),
});

export type InquiryData = z.infer<typeof inquirySchema>;

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  email: z.string().trim().email("Please enter a valid work email").max(160),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s-]{7,16}$/, "Please enter a valid phone number (at least 8 digits)"),
  company: z.string().trim().max(100).optional(),
  purpose: z.string().optional(),
  quantity: z.string().optional(),
  date: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === "") return true;
      return val >= getTodayISTDateString();
    }, "Target date cannot be in the past"),
  message: z
    .string()
    .trim()
    .min(5, "Please enter at least 5 characters for your message")
    .max(2000),
  turnstileToken: z.string().optional(),
  hp_website: z.string().optional(),
  _renderedAt: z.number().optional(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

export type SubmitResult =
  | { ok: true; id?: string; mode: "sent" | "not-configured"; message?: string }
  | { ok: false; error: string };

const INQUIRY_ENDPOINT: string = import.meta.env["VITE_INQUIRY_ENDPOINT"] || "/api/inquire";
const CONTACT_ENDPOINT: string = import.meta.env["VITE_CONTACT_ENDPOINT"] || "/api/contact";

export async function submitInquiry(data: InquiryData): Promise<SubmitResult> {
  try {
    const payload = {
      ...data,
      source: "Corporate Gifting Quote Wizard",
      pageUrl: typeof window !== "undefined" ? window.location.href : "",
      _renderedAt: data._renderedAt || Date.now(),
    };

    const res = await fetch(INQUIRY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => null);
      return {
        ok: false,
        error:
          errorJson?.error ||
          "We couldn't submit your enquiry. Please try again or reach out on WhatsApp.",
      };
    }

    const resData = await res.json().catch(() => null);
    return {
      ok: true,
      id: resData?.id,
      mode: "sent",
      message: resData?.message,
    };
  } catch {
    return {
      ok: false,
      error: "Network connection issue - please try again or message us on WhatsApp.",
    };
  }
}

export async function submitContactForm(data: ContactFormData): Promise<SubmitResult> {
  try {
    const payload = {
      ...data,
      source: "Contact Us Page",
      intent: data.purpose || "General Corporate Gifting Enquiry",
      notes: data.message,
      pageUrl: typeof window !== "undefined" ? window.location.href : "",
      _renderedAt: data._renderedAt || Date.now(),
    };

    const res = await fetch(CONTACT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => null);
      return {
        ok: false,
        error:
          errorJson?.error ||
          "We couldn't send your message. Please try again or contact us directly.",
      };
    }

    const resData = await res.json().catch(() => null);
    return {
      ok: true,
      id: resData?.id,
      mode: "sent",
      message: resData?.message,
    };
  } catch {
    return {
      ok: false,
      error: "Network problem - please check your connection or reach out via WhatsApp.",
    };
  }
}

export function inquiryToText(
  d: InquiryData,
  labels: { categories: string[]; products: string[] },
): string {
  const intent = INTENTS.find((i) => i.value === d.intent)?.label ?? d.intent;
  return [
    "Hi Urban Craft & Co., here is my gifting enquiry:",
    `• Purpose: ${intent}`,
    labels.categories.length ? `• Categories: ${labels.categories.join(", ")}` : "",
    labels.products.length ? `• Products: ${labels.products.join(", ")}` : "",
    `• Quantity: ${d.quantity}`,
    d.date ? `• Needed by: ${d.date}` : "",
    `• Logo customization: ${d.customization}`,
    d.location ? `• Delivery: ${d.location}` : "",
    `• Name: ${d.name}${d.company ? ` (${d.company})` : ""}`,
    `• Email: ${d.email}`,
    `• Phone: ${d.phone}`,
    d.notes ? `• Notes: ${d.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
