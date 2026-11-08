import { WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import { useEffect, useMemo, useState } from "react";
import { useForm, Controller, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Check, Mail, X, AlertCircle, FileText } from "lucide-react";
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

  // Determine localhost / dev environment for test key auto-pass
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "::1");

  const isTurnstileReady = Boolean(turnstileToken) || import.meta.env.DEV || isLocalhost;

  // Apply session draft + incoming context each time the dialog is opened from a CTA.
  useEffect(() => {
    const draft = loadDraft();
    const merged = applyInquiryContext({ ...EMPTY, ...draft }, prefill);
    reset(merged);
    setStep(prefill.intent ? 1 : 0);
    setStatus("idle");
    setTurnstileToken("");
    setError("");
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

  const executeSubmit = async () => {
    // HARD GATE: Never allow submission unless strictly on the final Review step
    if (step !== STEPS.length - 1) {
      void next();
      return;
    }

    // Trigger validation for all fields
    const isValid = await trigger();
    if (!isValid) return;

    if (!isTurnstileReady) {
      setError("Please complete the security verification challenge before submitting.");
      return;
    }

    setStatus("submitting");
    setError("");

    const currentValues = form.getValues();
    const submissionData: InquiryData = {
      ...currentValues,
      turnstileToken:
        turnstileToken ||
        currentValues.turnstileToken ||
        (import.meta.env.DEV || isLocalhost ? "1x00000000000000000000AA" : ""),
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
  };

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
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (step < STEPS.length - 1) {
                    void next();
                  } else {
                    void executeSubmit();
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.target as HTMLElement)?.tagName === "INPUT") {
                    e.preventDefault();
                    if (step < STEPS.length - 1) {
                      void next();
                    }
                  }
                }}
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
                          [
                            "name",
                            "Your name",
                            "text",
                            "name",
                            "Client contact person's full name",
                          ],
                          [
                            "company",
                            "Company (optional)",
                            "text",
                            "organization",
                            "Enterprise, corporate, or organization name",
                          ],
                          [
                            "email",
                            "Work email",
                            "email",
                            "email",
                            "Work email address for quote delivery",
                          ],
                          [
                            "phone",
                            "Phone / WhatsApp",
                            "tel",
                            "tel",
                            "Phone or WhatsApp number for coordination",
                          ],
                        ] as const
                      ).map(([k, label, type, ac, desc]) => (
                        <div key={k}>
                          <Label htmlFor={`inq-${k}`}>{label}</Label>
                          <Input
                            id={`inq-${k}`}
                            type={type}
                            autoComplete={ac}
                            className="mt-1.5 h-11"
                            toolparamdescription={desc}
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
                        <Label htmlFor="inq-notes" className="font-semibold text-olive text-sm">
                          Anything else?{" "}
                          <span className="font-normal text-muted-foreground">(optional)</span>
                        </Label>
                        <Textarea
                          id="inq-notes"
                          rows={2}
                          className="mt-1.5"
                          placeholder="Budget range, packaging preferences, a reference product…"
                          toolparamdescription="Additional project details, custom branding requirements, packaging notes"
                          {...register("notes")}
                        />
                      </div>

                      {/* Structured Review Summary */}
                      <div className="rounded-2xl border border-border bg-muted/40 p-4">
                        <div className="flex items-center justify-between pb-3 border-b border-border/70 mb-3">
                          <p className="text-xs font-semibold uppercase tracking-wider text-olive flex items-center gap-1.5">
                            <FileText className="size-3.5" />
                            <span>Enquiry Summary</span>
                          </p>
                          <span className="text-[0.7rem] text-muted-foreground font-medium">
                            Step 5 of 5: Review &amp; Confirm
                          </span>
                        </div>

                        <div className="grid gap-2.5 text-xs sm:grid-cols-2">
                          <div>
                            <span className="text-muted-foreground block text-[0.7rem]">
                              Purpose:
                            </span>
                            <span className="font-medium text-olive">
                              {INTENTS.find((i) => i.value === values.intent)?.label ||
                                values.intent ||
                                "Corporate Gifting"}
                            </span>
                          </div>
                          {values.quantity && (
                            <div>
                              <span className="text-muted-foreground block text-[0.7rem]">
                                Estimated Quantity:
                              </span>
                              <span className="font-medium text-olive">
                                {values.quantity} units
                              </span>
                            </div>
                          )}
                          {values.date && (
                            <div>
                              <span className="text-muted-foreground block text-[0.7rem]">
                                Target Delivery:
                              </span>
                              <span className="font-medium text-olive">{values.date}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-muted-foreground block text-[0.7rem]">
                              Contact:
                            </span>
                            <span className="font-medium text-olive">
                              {values.name} {values.company ? `(${values.company})` : ""}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[0.7rem]">
                              Email / Phone:
                            </span>
                            <span className="font-medium text-olive">
                              {values.email} &bull; {values.phone}
                            </span>
                          </div>
                          {values.location && (
                            <div>
                              <span className="text-muted-foreground block text-[0.7rem]">
                                Delivery Location:
                              </span>
                              <span className="font-medium text-olive">{values.location}</span>
                            </div>
                          )}
                        </div>

                        {selectedProducts.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border/70">
                            <span className="text-muted-foreground block text-[0.7rem] mb-1.5">
                              Selected Items ({selectedProducts.length}):
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedProducts.map((p) => (
                                <span
                                  key={p.sku}
                                  className="inline-flex items-center rounded-lg bg-card px-2 py-1 text-[0.75rem] font-medium text-olive border border-border"
                                >
                                  {p.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Verification */}
                      <div className="pt-1">
                        <TurnstileWidget
                          onVerify={(token) => {
                            setTurnstileToken(token);
                            setValue("turnstileToken", token);
                            setError("");
                          }}
                          onExpire={() => {
                            setTurnstileToken("");
                            setValue("turnstileToken", "");
                          }}
                          onError={(err) => {
                            console.warn("Turnstile widget error:", err);
                          }}
                        />
                      </div>

                      {status === "error" && (
                        <div
                          className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2"
                          role="alert"
                        >
                          <AlertCircle className="size-4 shrink-0 mt-0.5" />
                          <span>{error}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-border bg-card px-5 pb-[max(env(safe-area-inset-bottom),1.25rem)] pt-4 md:px-7">
                  <Button
                    key="inquiry-btn-back"
                    type="button"
                    variant="ghost"
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    disabled={step === 0 || status === "submitting"}
                  >
                    <ArrowLeft /> Back
                  </Button>
                  {step < STEPS.length - 1 ? (
                    <Button
                      key="inquiry-btn-continue"
                      type="button"
                      size="lg"
                      onClick={(e) => {
                        e.preventDefault();
                        void next();
                      }}
                    >
                      Continue <ArrowRight />
                    </Button>
                  ) : (
                    <Button
                      key="inquiry-btn-submit"
                      type="button"
                      size="lg"
                      disabled={status === "submitting" || !isTurnstileReady}
                      onClick={(e) => {
                        e.preventDefault();
                        void executeSubmit();
                      }}
                      className="min-w-44"
                    >
                      {status === "submitting" ? (
                        <MarkLoader size={20} label="Submitting..." />
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
