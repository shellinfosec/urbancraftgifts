import { Link } from "@tanstack/react-router";
import { Heart, Home, LayoutGrid, Search, Send } from "lucide-react";
import { useOverlays } from "@/components/providers/OverlayProvider";
import { useFavorites } from "@/lib/favorites";
import { Button } from "@/components/ui/button";

const item =
  "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[0.66rem] font-medium text-slate";

export function MobileBottomNav() {
  const { openSearch, openInquiry, openFavorites } = useOverlays();
  const fav = useFavorites();
  return (
    <nav
      aria-label="Quick actions"
      className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-safe backdrop-blur md:hidden"
    >
      <div className="grid grid-cols-5 items-center">
        <Link
          to="/"
          className={item}
          activeProps={{ className: "text-olive" }}
          activeOptions={{ exact: true }}
        >
          <Home className="size-5" />
          Home
        </Link>
        <Link to="/categories" className={item} activeProps={{ className: "text-olive" }}>
          <LayoutGrid className="size-5" />
          Categories
        </Link>
        <Button
          variant="ghost"
          type="button"
          onClick={() => openInquiry()}
          className={`${item} h-auto gap-1 rounded-none px-0 text-olive`}
        >
          <span className="-mt-3 inline-flex h-11 w-11 items-center justify-center rounded-full border-4 border-background bg-olive text-primary-foreground shadow-soft">
            <Send className="size-5" />
          </span>
          Enquire
        </Button>
        <Button
          variant="ghost"
          type="button"
          onClick={openSearch}
          className={`${item} h-auto rounded-none px-0`}
        >
          <Search className="size-5" />
          Search
        </Button>
        <Button
          variant="ghost"
          onClick={openFavorites}
          className={`${item} relative h-auto rounded-none px-0`}
        >
          <Heart className="size-5" />
          Favourites
          {fav.list.length > 0 && (
            <span className="absolute right-[calc(50%-18px)] top-2 min-w-4 rounded-full bg-terracotta px-1 text-center text-[0.58rem] font-bold leading-4 text-primary-foreground">
              {fav.list.length}
            </span>
          )}
        </Button>
      </div>
    </nav>
  );
}
