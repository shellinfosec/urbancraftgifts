import { Reveal } from "@/components/common/Reveal";
import { WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import { ArrowUpRight, Eye } from "lucide-react";
import { CATEGORY_MAP } from "@/config/categories";
import { displaySku, type Product } from "@/lib/catalog";
import { whatsappUrl } from "@/lib/whatsapp";
import { useOverlays } from "@/components/providers/OverlayProvider";
import { ProductCardGallery } from "./ProductCardGallery";
import { FavoriteButton } from "./FavoriteButton";
import { cn } from "@/lib/utils";

export function ProductCard({
  product,
  priority,
  className,
}: {
  product: Product;
  priority?: boolean;
  className?: string;
}) {
  const { openQuickView } = useOverlays();
  const cat = CATEGORY_MAP[product.category];
  const attr = [product.materials[0], product.customization.length ? "Customizable" : null]
    .filter(Boolean)
    .join(" · ");
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card card-hover",
        className,
      )}
    >
      <ProductCardGallery
        images={product.images}
        name={product.name}
        alt={product.alt || product.name}
        tone={cat?.tone}
        priority={priority}
        imgClassName="group-hover:scale-[1.03]"
        onOpen={() => openQuickView(product.sku)}
      />
      <div className="absolute right-3 top-3">
        <FavoriteButton sku={product.sku} name={product.name} />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="eyebrow text-[0.62rem] text-brown">{cat?.shortName}</p>
        <h3 className="line-clamp-2 font-sans text-[0.95rem] font-semibold leading-snug text-charcoal">
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">SKU</span> {displaySku(product.sku)}
          {attr && <span className="hidden sm:inline"> · {attr}</span>}
        </p>
        <div className="mt-auto flex items-center gap-2 pt-3">
          <button
            type="button"
            onClick={() => openQuickView(product.sku)}
            className="hidden h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 sm:inline-flex"
          >
            View details <ArrowUpRight className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => openQuickView(product.sku)}
            aria-label={`View details: ${product.name}`}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-primary text-primary-foreground transition hover:bg-primary/90 sm:hidden"
          >
            <Eye className="size-4" />
          </button>
          <a
            href={whatsappUrl({ kind: "product", product })}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Enquire about ${product.name} on WhatsApp`}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-whatsapp/35 text-whatsapp-ink transition hover:bg-whatsapp/10"
          >
            <WhatsAppIcon className="size-4" />
          </a>
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card" aria-hidden>
      <div className="skeleton-shimmer aspect-square" />
      <div className="space-y-2 p-4">
        <div className="skeleton-shimmer h-2.5 w-16 rounded" />
        <div className="skeleton-shimmer h-4 w-4/5 rounded" />
        <div className="skeleton-shimmer h-3 w-1/2 rounded" />
        <div className="skeleton-shimmer mt-4 h-10 rounded-xl" />
      </div>
    </div>
  );
}

export function ProductGrid({
  products,
  priorityCount = 4,
}: {
  products: Product[];
  priorityCount?: number;
}) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p, i) => (
        <Reveal as="li" key={p.sku} delay={(i % 4) * 0.06} className="flex">
          <ProductCard product={p} priority={i < priorityCount} className="w-full" />
        </Reveal>
      ))}
    </ul>
  );
}
