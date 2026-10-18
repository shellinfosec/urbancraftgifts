import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useFavorites } from "@/lib/favorites";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  sku,
  name,
  className,
  withLabel,
}: {
  sku: string;
  name: string;
  className?: string;
  withLabel?: boolean;
}) {
  const fav = useFavorites();
  const on = fav.has(sku);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from favourites` : `Save ${name} to favourites`}
      onClick={(e) => {
        e.stopPropagation();
        const now = fav.toggle(sku);
        toast(now ? "Saved to favourites" : "Removed from favourites");
      }}
      className={cn(
        "inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-full border border-border bg-card/90 px-2.5 text-olive backdrop-blur transition hover:border-brown/50 hover:text-brown",
        on && "border-terracotta/40 text-terracotta",
        className,
      )}
    >
      <Heart className={cn("size-[18px] transition-transform", on && "scale-110 fill-current")} />
      {withLabel && <span className="pr-1 text-sm font-medium">{on ? "Saved" : "Save"}</span>}
    </button>
  );
}
