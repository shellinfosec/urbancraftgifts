import {
  createContext,
  lazy,
  Suspense,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface InquiryPrefill {
  categories?: string[] | undefined;
  products?: string[] | undefined;
  intent?: string | undefined;
}

interface OverlayApi {
  openQuickView: (sku: string) => void;
  openInquiry: (prefill?: InquiryPrefill) => void;
  openSearch: () => void;
  openFavorites: () => void;
}

const Ctx = createContext<OverlayApi | null>(null);

const ProductQuickView = lazy(() => import("@/components/product/ProductQuickView"));
const InquiryDialog = lazy(() => import("@/components/inquiry/InquiryDialog"));
const SearchCommand = lazy(() => import("@/components/search/SearchCommand"));
const FavoritesDrawer = lazy(() => import("@/components/product/FavoritesDrawer"));

/** Global overlays (quick view, inquiry, search) - justified shared state, loaded on first use. */
export function OverlayProvider({ children }: { children: ReactNode }) {
  const [quickSku, setQuickSku] = useState<string | null>(null);
  const [inquiry, setInquiry] = useState<{ open: boolean; prefill: InquiryPrefill; key: number }>({
    open: false,
    prefill: {},
    key: 0,
  });
  const [searchOpen, setSearchOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [favoritesMounted, setFavoritesMounted] = useState(false);
  const [mounted, setMounted] = useState({ quick: false, inquiry: false, search: false });

  const openQuickView = useCallback((sku: string) => {
    setMounted((m) => ({ ...m, quick: true }));
    setQuickSku(sku);
  }, []);
  const openInquiry = useCallback((prefill: InquiryPrefill = {}) => {
    setMounted((m) => ({ ...m, inquiry: true }));
    setQuickSku(null);
    setInquiry((s) => ({ open: true, prefill, key: s.key + 1 }));
  }, []);
  const openSearch = useCallback(() => {
    setMounted((m) => ({ ...m, search: true }));
    setSearchOpen(true);
  }, []);

  const openFavorites = useCallback(() => {
    setFavoritesMounted(true);
    setFavoritesOpen(true);
  }, []);
  const api = useMemo(
    () => ({ openQuickView, openInquiry, openSearch, openFavorites }),
    [openQuickView, openInquiry, openSearch, openFavorites],
  );

  return (
    <Ctx.Provider value={api}>
      {children}
      <Suspense fallback={null}>
        {mounted.quick && <ProductQuickView sku={quickSku} onClose={() => setQuickSku(null)} />}
        {mounted.inquiry && (
          <InquiryDialog
            open={inquiry.open}
            prefill={inquiry.prefill}
            prefillKey={inquiry.key}
            onOpenChange={(open) => setInquiry((s) => ({ ...s, open }))}
          />
        )}
        {mounted.search && <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />}
        {favoritesMounted && (
          <FavoritesDrawer open={favoritesOpen} onOpenChange={setFavoritesOpen} />
        )}
      </Suspense>
    </Ctx.Provider>
  );
}

export function useOverlays(): OverlayApi {
  const v = useContext(Ctx);
  if (!v) throw new Error("useOverlays must be used inside OverlayProvider");
  return v;
}
