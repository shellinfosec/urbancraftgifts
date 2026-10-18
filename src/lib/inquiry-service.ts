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

export const inquirySchema = z.object({
  intent: z.string().min(1, "Choose what the gifts are for"),
  categories: z.array(z.string()),
  products: z.array(z.string()),
  quantity: z.string().min(1, "Choose an approximate quantity"),
  date: z.string().optional(),
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
});

export type InquiryData = z.infer<typeof inquirySchema>;

export type SubmitResult =
  { ok: true; mode: "sent" | "not-configured" } | { ok: false; error: string };

/**
 * Adapter boundary for inquiry submission. Point INQUIRY_ENDPOINT at a real backend later;
 * the UI does not need to change. With no endpoint, we never claim the inquiry was sent.
 */
const INQUIRY_ENDPOINT: string | undefined = import.meta.env["VITE_INQUIRY_ENDPOINT"];

export async function submitInquiry(data: InquiryData): Promise<SubmitResult> {
  if (!INQUIRY_ENDPOINT) return { ok: true, mode: "not-configured" };
  try {
    const res = await fetch(INQUIRY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok)
      return {
        ok: false,
        error: "We couldn't send your enquiry. Please try again or use WhatsApp.",
      };
    return { ok: true, mode: "sent" };
  } catch {
    return { ok: false, error: "Network problem - please try again or use WhatsApp." };
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
