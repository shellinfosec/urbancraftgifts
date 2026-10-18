import { WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import { useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Link } from "@tanstack/react-router";
import { Check, Link2, Send, Share2, X } from "lucide-react";
import { toast } from "sonner";
import { CATEGORY_MAP } from "@/config/categories";
import { BUSINESS } from "@/config/business";
import { colorSwatch, displaySku, getProduct } from "@/lib/catalog";
import { whatsappUrl } from "@/lib/whatsapp";
import { useOverlays } from "@/components/providers/OverlayProvider";
import { Button } from "@/components/ui/button";
import { ProductImageStage } from "./ProductImageStage";
import { FavoriteButton } from "./FavoriteButton";
import { cn } from "@/lib/utils";

function shareUrlFor(sku: string, category: string) {
  return `${BUSINESS.siteUrl}/categories/${category}?p=${encodeURIComponent(sku)}`;
}

export default function ProductQuickView({
  sku,
  onClose,
}: {
  sku: string | null;
  onClose: () => void;
}) {
  const product = sku ? getProduct(sku) : undefined;
  const { openInquiry } = useOverlays();
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setActive(0);
    setCopied(false);
  }, [sku]);

  const cat = product ? CATEGORY_MAP[product.category] : undefined;
  const pageUrl = product ? shareUrlFor(product.sku, product.category) : "";

  const share = async () => {
    if (!product) return;
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: product.name, url: pageUrl });
        return;
      } catch {
        /* user cancelled - fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      toast("Link copied");
    } catch {
      toast("Couldn't copy the link");
    }
  };

  return (
    <DialogPrimitive.Root open={!!product} onOpenChange={(o) => !o && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed z-50 flex flex-col overflow-hidden bg-card shadow-lift outline-none",
            "inset-x-0 bottom-0 max-h-[94dvh] rounded-t-3xl data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom",
            "md:inset-auto md:left-1/2 md:top-1/2 md:max-h-[88vh] md:w-[min(1040px,92vw)] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-3xl md:data-[state=open]:slide-in-from-bottom-4 md:data-[state=open]:zoom-in-[0.98]",
          )}
        >
          {product && cat && (
            <>
              <div
                className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-border md:hidden"
                aria-hidden
              />
              <DialogPrimitive.Close
                className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/95 text-olive transition hover:bg-muted"
                aria-label="Close"
              >
                <X className="size-5" />
              </DialogPrimitive.Close>
              <div className="grid flex-1 overflow-y-auto md:grid-cols-[1.05fr_1fr]">
                {/* Gallery */}
                <div className="p-3 md:p-5">
                  <ProductImageStage
                    key={product.images[active]}
                    src={product.images[active] ?? product.images[0] ?? ""}
                    alt={product.alt || product.name}
                    tone={cat.tone}
                    priority
                    className="rounded-2xl"
                  />
                  {product.images.length > 1 && (
                    <div
                      className="mt-3 flex gap-2 overflow-x-auto no-scrollbar"
                      role="tablist"
                      aria-label="Product views"
                    >
                      {product.images.map((src, i) => (
                        <button
                          key={src}
                          role="tab"
                          aria-selected={i === active}
                          aria-label={`View ${i + 1}`}
                          onClick={() => setActive(i)}
                          className={cn(
                            "w-16 shrink-0 overflow-hidden rounded-xl border-2 transition",
                            i === active
                              ? "border-olive"
                              : "border-transparent opacity-70 hover:opacity-100",
                          )}
                        >
                          <ProductImageStage src={src} alt="" tone={cat.tone} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Details */}
                <div className="flex flex-col gap-5 px-5 pb-36 sm:pb-32 pt-1 md:px-7 md:pb-7 md:pt-8">
                  <div>
                    <Link
                      to="/categories/$slug"
                      params={{ slug: cat.slug }}
                      onClick={onClose}
                      className="eyebrow text-brown hover:underline"
                    >
                      {cat.name}
                    </Link>
                    <DialogPrimitive.Title className="mt-2 font-display text-xl leading-snug text-olive md:text-2xl">
                      {product.name}
                    </DialogPrimitive.Title>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      SKU {displaySku(product.sku)}
                    </p>
                  </div>
                  <DialogPrimitive.Description className="text-sm leading-relaxed text-slate">
                    {product.summary}
                  </DialogPrimitive.Description>

                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl bg-muted/60 p-4 text-sm">
                    <div>
                      <dt className="text-xs text-muted-foreground">Colour</dt>
                      <dd className="flex items-center gap-2 font-medium">
                        {colorSwatch(product.color) && (
                          <span
                            aria-hidden
                            className="inline-block size-4 shrink-0 rounded-full border border-border shadow-inner"
                            style={{ backgroundColor: colorSwatch(product.color) ?? undefined }}
                          />
                        )}
                        {product.color}
                      </dd>
                    </div>
                    {product.materials.length > 0 && (
                      <div>
                        <dt className="text-xs text-muted-foreground">Finish / material</dt>
                        <dd className="font-medium">{product.materials.slice(0, 3).join(", ")}</dd>
                      </div>
                    )}
                    {product.useCases.length > 0 && (
                      <div className="col-span-2">
                        <dt className="text-xs text-muted-foreground">Good for</dt>
                        <dd className="font-medium">{product.useCases.slice(0, 4).join(" · ")}</dd>
                      </div>
                    )}
                  </dl>

                  {product.customization.length > 0 && (
                    <div>
                      <h3 className="font-sans text-sm font-semibold text-olive">
                        Possible branding methods
                      </h3>
                      <ul className="mt-2 flex flex-wrap gap-2">
                        {product.customization.map((m) => (
                          <li
                            key={m}
                            className="rounded-full border border-border px-3 py-1 text-xs"
                          >
                            {m}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Final method is confirmed per product when you enquire.
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <FavoriteButton sku={product.sku} name={product.name} withLabel />
                    <button
                      type="button"
                      onClick={share}
                      className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-3.5 text-sm font-medium text-olive hover:bg-muted"
                    >
                      {copied ? (
                        <Check className="size-4" />
                      ) : "share" in (typeof navigator !== "undefined" ? navigator : {}) ? (
                        <Share2 className="size-4" />
                      ) : (
                        <Link2 className="size-4" />
                      )}
                      {copied ? "Copied" : "Share"}
                    </button>
                  </div>

                  {/* Actions - sticky on mobile with generous bottom padding */}
                  <div className="fixed inset-x-0 bottom-0 z-20 flex gap-2.5 border-t border-border bg-card/98 px-4 pt-3 pb-[max(1.75rem,calc(env(safe-area-inset-bottom)+0.75rem))] backdrop-blur-md shadow-lift md:static md:mt-auto md:border-0 md:bg-transparent md:p-0">
                    <Button
                      className="flex-1 h-11 text-sm font-semibold shadow-xs"
                      size="lg"
                      onClick={() =>
                        openInquiry({ products: [product.sku], categories: [product.category] })
                      }
                    >
                      <Send className="size-4" /> Request a quote
                    </Button>
                    <Button
                      asChild
                      variant="whatsapp"
                      size="lg"
                      className="flex-1 h-11 text-sm font-semibold shadow-xs"
                    >
                      <a
                        href={whatsappUrl({ kind: "product", product, pageUrl })}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <WhatsAppIcon className="size-4" /> WhatsApp
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
