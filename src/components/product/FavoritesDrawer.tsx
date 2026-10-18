import { Link } from "@tanstack/react-router";
import { ArrowRight, Heart, Trash2, Send } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { BrandImage } from "@/components/common/BrandImage";
import { getProduct, type Product } from "@/lib/catalog";
import { useFavorites } from "@/lib/favorites";
import { useOverlays } from "@/components/providers/OverlayProvider";

export default function FavoritesDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const fav = useFavorites();
  const { openQuickView, openInquiry } = useOverlays();
  const products = fav.list.map(getProduct).filter((p): p is Product => !!p);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="shrink-0 border-b border-border px-6 py-6 pr-12 text-left">
          <SheetTitle className="flex items-center gap-2">
            <Heart className="size-5 text-terracotta" /> Your favourites
          </SheetTitle>
          <SheetDescription>
            {products.length
              ? `${products.length} saved in your shortlist`
              : "Your gifting shortlist"}
          </SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6">
          {products.length ? (
            <ul className="divide-y divide-border">
              {products.map((p) => (
                <li key={p.sku} className="flex items-center gap-4 py-5">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      onOpenChange(false);
                      openQuickView(p.sku);
                    }}
                    className="h-24 w-24 shrink-0 rounded-lg bg-stage-stone p-2"
                    aria-label={`View ${p.name}`}
                  >
                    <BrandImage src={p.images[0]} alt={p.name} className="h-full w-full" />
                  </Button>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-relaxed text-foreground">
                      {p.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{p.color}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground"
                    aria-label={`Remove ${p.name} from favourites`}
                    onClick={() => fav.toggle(p.sku)}
                  >
                    <Trash2 />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex h-full min-h-64 flex-col items-center justify-center gap-5 text-center">
              <Heart className="size-10 text-terracotta" />
              <h3 className="text-lg">No favourites yet</h3>
              <Button asChild variant="outline">
                <Link to="/products" onClick={() => onOpenChange(false)}>
                  Browse products <ArrowRight />
                </Link>
              </Button>
            </div>
          )}
        </div>
        <div className="grid shrink-0 gap-3 border-t border-border p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {products.length > 0 && (
            <Button
              size="lg"
              onClick={() => {
                onOpenChange(false);
                openInquiry({ products: products.map((p) => p.sku) });
              }}
            >
              <Send /> Enquire about shortlist
            </Button>
          )}
          <Button asChild variant="outline" size="lg">
            <Link to="/favorites" onClick={() => onOpenChange(false)}>
              View all favourites <ArrowRight />
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
