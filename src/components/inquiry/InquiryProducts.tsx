import { X } from "lucide-react";
import { CATEGORY_MAP } from "@/config/categories";
import { displaySku, type Product } from "@/lib/catalog";
import { ProductImageStage } from "@/components/product/ProductImageStage";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  products: Product[];
  onRemove: (sku: string) => void;
  editable: boolean;
}

export function InquiryProducts({ products, onRemove, editable }: Props) {
  const single = products.length === 1;
  return (
    <aside
      aria-label="Products in your enquiry"
      className="flex min-h-0 shrink-0 flex-col border-b border-border bg-muted/40 lg:w-80 lg:border-b-0 lg:border-r"
    >
      <h2 className="shrink-0 px-5 pb-2 pt-4 text-sm font-semibold text-olive lg:px-6 lg:pt-6">
        {single ? "Your selected product" : "Your selected products"}
      </h2>
      <ul className="flex max-h-40 gap-3 overflow-x-auto px-5 pb-4 lg:max-h-[min(52dvh,520px)] lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto lg:px-6 lg:pb-6">
        {products.map((product) => (
          <li
            key={product.sku}
            className={cn(
              "relative flex w-64 shrink-0 items-center gap-3 lg:w-auto",
              single && "lg:flex-col lg:items-stretch lg:gap-4",
            )}
          >
            <ProductImageStage
              src={product.images[0] ?? ""}
              alt={product.alt || product.name}
              tone={CATEGORY_MAP[product.category]?.tone}
              priority
              className={cn("w-20 shrink-0 rounded-lg", single && "lg:w-full")}
            />
            <div className="min-w-0 flex-1 pr-7 lg:pr-6">
              <p className="text-[0.65rem] font-medium uppercase text-brown">
                {CATEGORY_MAP[product.category]?.name}
              </p>
              <h3
                className={cn(
                  "mt-1 text-sm font-semibold leading-snug text-olive",
                  single && "lg:font-display lg:text-xl",
                )}
              >
                {product.name}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">{displaySku(product.sku)}</p>
              {single && (
                <p className="mt-3 hidden text-xs leading-relaxed text-slate lg:block">
                  {product.summary}
                </p>
              )}
            </div>
            {editable && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 size-8 rounded-full bg-card/90"
                aria-label={`Remove ${product.name} from enquiry`}
                onClick={() => onRemove(product.sku)}
              >
                <X className="size-4" />
              </Button>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
}
