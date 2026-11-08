import { WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import { useEffect, useMemo, useState } from "react";
import { useForm, Controller, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Check, Mail, X } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { CATEGORIES, CATEGORY_MAP } from "@/config/categories";
import { BUSINESS } from "@/config/business";
import { getProduct, displaySku } from "@/lib/catalog";
import {
  INTENTS,
  QUANTITY_RANGES,
  inquirySchema,
  inquiryToText,
  submitInquiry,
  getTodayISTDateString,
  type InquiryData,
} from "@/lib/inquiry-service";
import type { InquiryPrefill } from "@/components/providers/OverlayProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MarkLoader } from "@/components/brand/Logo";
import { TurnstileWidget } from "@/components/common/TurnstileWidget";
import { cn } from "@/lib/utils";
import { applyInquiryContext } from "@/lib/inquiry-context";
import { InquiryProducts } from "./InquiryProducts";

const DRAFT_KEY = "uc:inquiry-draft:v1";

const STEPS: { title: string; fields: FieldPath<InquiryData>[] }[] = [
  { title: "Purpose", fields: ["intent"] },
  { title: "Products", fields: ["categories", "products"] },
  { title: "Details", fields: ["quantity", "date", "customization", "location"] },
  { title: "Contact", fields: ["name", "company", "email", "phone"] },
  { title: "Review", fields: ["notes"] },
];

const EMPTY: InquiryData = {
  intent: "",
  categories: [],
  products: [],
  quantity: "",
  date: "",
  customization: "unsure",
  location: "",
  name: "",
  company: "",
  email: "",
  phone: "",
  notes: "",
  turnstileToken: "",
  hp_website: "",
};

function loadDraft(): Partial<InquiryData> {
  try {
    return JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? "{}");
  } catch {
    return {};
  }
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefill: InquiryPrefill;
  prefillKey: number;
}

export default function InquiryDialog({ open, onOpenChange, prefill, prefillKey }: Props) {
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [mode, setMode] = useState<"sent" | "not-configured">("not-configured");
  const [error, setError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

  const form = useForm<InquiryData>({
    resolver: zodResolver(inquirySchema),
    defaultValues: EMPTY,
    mode: "onTouched",
  });
  const {
    register,
    control,
    handleSubmit,
    trigger,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = form;

  // Apply session draft + incoming context each time the dialog is opened from a CTA.
  useEffect(() => {
    const draft = loadDraft();
    const merged = applyInquiryContext({ ...EMPTY, ...draft }, prefill);
    reset(merged);
    setStep(prefill.intent ? 1 : 0);
    setStatus("idle");
  }, [prefillKey, prefill, reset]);

  const values = watch();
  const selectedProducts = (values.products ?? []).flatMap((sku) => {
    const product = getProduct(sku);
    return product ? [product] : [];
  });
  useEffect(() => {
    if (status === "done") return;
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(values));
    } catch {
      /* ignore */
    }
  }, [values, status]);

  const labels = useMemo(
    () => ({
      categories: (values.categories ?? []).map((c) => CATEGORY_MAP[c]?.name ?? c),
      products: (values.products ?? []).map((s) => {
        const p = getProduct(s);
        return p ? `${p.name} (${displaySku(p.sku)})` : s;
      }),
    }),
    [values.categories, values.products],
  );

  const next = async () => {
    if (await trigger(STEPS[step]?.fields ?? [])) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const onSubmit = handleSubmit(async (data) => {
    setStatus("submitting");
    setError("");
    const submissionData: InquiryData = {
      ...data,
      turnstileToken:
        turnstileToken ||
        data.turnstileToken ||
        (import.meta.env.DEV ? "1x00000000000000000000AA" : ""),
    };
    const res = await submitInquiry(submissionData);
    if (res.ok) {
      setMode(res.mode);
      setStatus("done");
      if (res.mode === "sent") sessionStorage.removeItem(DRAFT_KEY);
    } else {
      setError(res.error);
      setStatus("error");
    }
  });

  const text = inquiryToText(values, labels);
  const waHref = `https://wa.me/${BUSINESS.whatsappNumber}?text=${encodeURIComponent(text)}`;
  const mailHref = `mailto:${BUSINESS.email}?subject=${encodeURIComponent("Corporate gifting enquiry")}&body=${encodeURIComponent(text)}`;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-charcoal/50 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 flex max-h-[94dvh] flex-col overflow-hidden rounded-t-3xl bg-card shadow-lift outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom md:inset-auto md:left-1/2 md:top-1/2 md:w-[min(640px,92vw)] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl md:data-[state=open]:slide-in-from-bottom-4",
            selectedProducts.length > 0 && "lg:w-[min(1000px,94vw)]",
          )}
        >
          <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 pb-4 pt-5 md:px-7">
            <div>
              <p className="eyebrow text-brown">Gifting enquiry</p>
              <DialogPrimitive.Title className="mt-1 font-display text-xl text-olive">
                {status === "done" ? "Your enquiry is ready" : "Tell us what you're planning"}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="sr-only">
                A short multi-step form to share your gifting requirement.
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-olive hover:bg-muted"
              aria-label="Close"
            >
              <X className="size-5" />
            </DialogPrimitive.Close>
          </header>

          <div
            className={cn(
              "flex min-h-0 flex-1 flex-col lg:flex-row",
              selectedProducts.length > 0 && "lg:min-h-[480px]",
            )}
          >
            {selectedProducts.length > 0 && (
              <InquiryProducts
                products={selectedProducts}
                editable={status !== "done" && status !== "submitting"}
                onRemove={(sku) =>
                  setValue(
                    "products",
                    values.products.filter((value) => value !== sku),
                  )
                }
              />
            )}
            {status === "done" ? (
              <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-y-auto px-6 py-10 text-center">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-sage/30 text-olive">
                  <Check className="size-7" />
                </span>
                {mode === "sent" ? (
                  <p className="max-w-sm text-sm text-slate">
                    Thank you - we've received your enquiry and will get back to you on{" "}
                    {values.email || "your email"}.
                  </p>
                ) : (
                  <p className="max-w-sm text-sm text-slate">
                    Online submission isn't connected yet. Send these details to us directly -
                    everything you entered is already filled in.
                  </p>
                )}
                <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
                  <Button asChild variant="whatsapp" size="lg">
                    <a href={waHref} target="_blank" rel="noopener noreferrer">
                      <WhatsAppIcon className="" /> Send on WhatsApp
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <a href={mailHref}>
                      <Mail /> Send by email
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={onSubmit}
                className="flex min-h-0 min-w-0 flex-1 flex-col"
                noValidate
                // Declarative WebMCP form annotations
                toolname="build_corporate_inquiry_quote"
                tooldescription="Multi-step corporate gifting proposal request builder for customized gift sets and merchandise"
              >
                <ol className="flex gap-1.5 px-5 pt-4 md:px-7" aria-label="Progress">
                  {STEPS.map((s, i) => (
                    <li key={s.title} className="flex-1">
                      <span
                        className={cn(
                          "block h-1 rounded-full transition-colors",
                          i <= step ? "bg-olive" : "bg-border",
                        )}
                      />
                      <span
                        className={cn(
                          "mt-1.5 hidden text-[0.68rem] font-medium sm:block",
                          i === step ? "text-olive" : "text-muted-foreground",
                        )}
                        aria-current={i === step ? "step" : undefined}
                      >
                        {s.title}
                      </span>
                    </li>
                  ))}
                </ol>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-7">
                  {step === 0 && (
                    <fieldset>
                      <legend className="mb-3 text-sm font-semibold text-olive">
                        What are the gifts for?
                      </legend>
                      <Controller
                        control={control}
                        name="intent"
                        render={({ field }) => (
                          <div className="grid gap-2 sm:grid-cols-2" role="radiogroup">
                            {INTENTS.map((i) => (
                              <button
                                type="button"
                                role="radio"
                                aria-checked={field.value === i.value}
                                key={i.value}
                                onClick={() => field.onChange(i.value)}
                                className={cn(
                                  "rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition",
                                  field.value === i.value
                                    ? "border-olive bg-olive text-primary-foreground"
                                    : "border-border hover:border-olive/50",
                                )}
                              >
                                {i.label}
                              </button>
                            ))}
                          </div>
                        )}
                      />
                      {errors.intent && (
                        <p className="mt-2 text-xs text-destructive" role="alert">
                          {errors.intent.message}
                        </p>
                      )}
                    </fieldset>
                  )}

                  {step === 1 && (
                    <div className="space-y-5">
                      {labels.products.length > 0 && selectedProducts.length === 0 && (
                        <div>
                          <p className="mb-2 text-sm font-semibold text-olive">
                            Products you selected
                          </p>
                          <ul className="flex flex-wrap gap-2">
                            {(values.products ?? []).map((s, i) => (
                              <li
                                key={s}
                                className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1.5 text-xs"
                              >
                                {labels.products[i]}
                                <button
                                  type="button"
                                  aria-label="Remove"
                                  onClick={() =>
                                    setValue(
                                      "products",
                                      values.products.filter((x) => x !== s),
                                    )
                                  }
                                  className="ml-1 rounded-full p-0.5 hover:bg-border"
                                >
                                  <X className="size-3" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <fieldset>
                        <legend className="mb-2 text-sm font-semibold text-olive">
                          Categories of interest{" "}
                          <span className="font-normal text-muted-foreground">(optional)</span>
                        </legend>
                        <Controller
                          control={control}
                          name="categories"
                          render={({ field }) => (
                            <div className="grid grid-cols-2 gap-2">
                              {CATEGORIES.map((c) => {
                                const on = field.value?.includes(c.slug);
                                return (
                                  <label
                                    key={c.slug}
                                    className={cn(
                                      "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-medium",
                                      on ? "border-olive bg-olive/5" : "border-border",
                                    )}
                                  >
                                    <input
                                      type="checkbox"
                                      className="accent-[var(--olive)]"
                                      checked={on}
                                      onChange={() =>
                                        field.onChange(
                                          on
                                            ? field.value.filter((x) => x !== c.slug)
                                            : [...(field.value ?? []), c.slug],
                                        )
                                      }
                                    />
                                    {c.name}
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        />
                      </fieldset>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-5">
                      <fieldset>
                        <legend className="mb-2 text-sm font-semibold text-olive">
                          Approximate quantity
                        </legend>
                        <Controller
                          control={control}
                          name="quantity"
                          render={({ field }) => (
                            <div className="flex flex-wrap gap-2" role="radiogroup">
                              {QUANTITY_RANGES.map((q) => (
                                <button
                                  type="button"
                                  role="radio"
                                  aria-checked={field.value === q}
                                  key={q}
                                  onClick={() => field.onChange(q)}
                                  className={cn(
                                    "h-10 rounded-full border px-4 text-sm",
                                    field.value === q
                                      ? "border-olive bg-olive text-primary-foreground"
                                      : "border-border hover:border-olive/50",
                                  )}
                                >
                                  {q}
                                </button>
                              ))}
                            </div>
                          )}
                        />
                        {errors.quantity && (
                          <p className="mt-2 text-xs text-destructive" role="alert">
                            {errors.quantity.message}
                          </p>
                        )}
                      </fieldset>
                      <fieldset>
                        <legend className="mb-2 text-sm font-semibold text-olive">
                          Logo or name customization?
                        </legend>
                        <Controller
                          control={control}
                          name="customization"
                          render={({ field }) => (
                            <div className="flex gap-2" role="radiogroup">
                              {(["yes", "no", "unsure"] as const).map((v) => (
                                <button
                                  type="button"
                                  role="radio"
                                  aria-checked={field.value === v}
                                  key={v}
                                  onClick={() => field.onChange(v)}
                                  className={cn(
                                    "h-10 flex-1 rounded-full border text-sm capitalize",
                                    field.value === v
                                      ? "border-olive bg-olive text-primary-foreground"
                                      : "border-border",
                                  )}
                                >
                                  {v === "unsure" ? "Not sure" : v}
                                </button>
                              ))}
                            </div>
                          )}
                        />
                      </fieldset>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="inq-date">
                            Needed by <span className="text-muted-foreground">(optional)</span>
                          </Label>
                          <Input
                            id="inq-date"
                            type="date"
                            min={getTodayISTDateString()}
                            className="mt-1.5 h-11"
                            toolparamdescription="Target delivery or event deadline (YYYY-MM-DD, cannot be in the past)"
                            {...register("date")}
                          />
                          {errors.date && (
                            <p className="mt-1.5 text-xs text-destructive" role="alert">
                              {errors.date.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="inq-loc">Delivery city / locations</Label>
                          <Input
                            id="inq-loc"
                            placeholder="e.g. Delhi, Gurugram"
                            className="mt-1.5 h-11"
                            toolparamdescription="Target delivery cities or office locations"
                            {...register("location")}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {(
                        [
                          ["name", "Your name", "text", "name"],
                          ["company", "Company (optional)", "text", "organization"],
                          ["email", "Work email", "email", "email"],
                          ["phone", "Phone / WhatsApp", "tel", "tel"],
                        ] as const
                      ).map(([k, label, type, ac]) => (
                        <div key={k}>
                          <Label htmlFor={`inq-${k}`}>{label}</Label>
                          <Input
                            id={`inq-${k}`}
                            type={type}
                            autoComplete={ac}
                            className="mt-1.5 h-11"
                            aria-invalid={!!errors[k]}
                            aria-describedby={errors[k] ? `inq-${k}-err` : undefined}
                            {...register(k)}
                          />
                          {errors[k] && (
                            <p
                              id={`inq-${k}-err`}
                              className="mt-1 text-xs text-destructive"
                              role="alert"
                            >
                              {errors[k]?.message}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {step === 4 && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="inq-notes">
                          Anything else? <span className="text-muted-foreground">(optional)</span>
                        </Label>
                        <Textarea
                          id="inq-notes"
                          rows={3}
                          className="mt-1.5"
                          placeholder="Budget range, packaging preferences, a reference product…"
                          {...register("notes")}
                        />
                      </div>
                      <div className="rounded-2xl bg-muted/60 p-4">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Summary
                        </p>
                        <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate">
                          {text.split("\n").slice(1).join("\n")}
                        </pre>
                      </div>

                      <div className="pt-2">
                        <TurnstileWidget
                          siteKey="0x4AAAAAAF4N2BizrqzpRRny"
                          onVerify={(token) => {
                            setTurnstileToken(token);
                            setValue("turnstileToken", token);
                          }}
                          onExpire={() => {
                            setTurnstileToken("");
                            setValue("turnstileToken", "");
                          }}
                          onError={(err) => console.warn("Turnstile widget error:", err)}
                        />
                      </div>

                      {status === "error" && (
                        <p className="text-sm text-destructive" role="alert">
                          {error}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-border bg-card px-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] pt-4 md:px-7">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    disabled={step === 0}
                  >
                    <ArrowLeft /> Back
                  </Button>
                  {step < STEPS.length - 1 ? (
                    <Button type="button" size="lg" onClick={next}>
                      Continue <ArrowRight />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      size="lg"
                      disabled={status === "submitting"}
                      className="min-w-36"
                    >
                      {status === "submitting" ? (
                        <MarkLoader size={20} label="Submitting" />
                      ) : (
                        <>
                          Submit enquiry <Check />
                        </>
                      )}
                    </Button>
                  )}
                </footer>
              </form>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
