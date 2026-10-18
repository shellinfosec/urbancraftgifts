import { WhatsAppIcon } from "@/components/brand/WhatsAppIcon";
import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, Mail, Menu, Phone, Search } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useOverlays } from "@/components/providers/OverlayProvider";
import { Button } from "@/components/ui/button";
import { BUSINESS } from "@/config/business";
import { PRIMARY_NAV } from "@/config/navigation";
import { useFavorites } from "@/lib/favorites";
import { whatsappUrl } from "@/lib/whatsapp";
import { MegaMenu } from "./MegaMenu";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { DesktopCategoryNav } from "./DesktopCategoryNav";
import { DesktopHeaderSearch } from "@/components/search/DesktopHeaderSearch";
import { cn } from "@/lib/utils";

function AnnouncementBar() {
  return (
    <div className="no-print hidden border-b border-olive-deep bg-olive text-primary-foreground md:block">
      <div className="container-site flex h-9 items-center justify-end gap-6 text-xs lg:justify-between">
        <p className="hidden truncate lg:block">
          Corporate gifts, welcome kits and branded bags - enquire for bulk orders and logo
          customization.
        </p>
        <div className="flex items-center gap-5">
          <a
            href={`tel:${BUSINESS.phoneE164}`}
            className="inline-flex items-center gap-1.5 hover:text-gold"
          >
            <Phone className="size-3.5" />
            {BUSINESS.phoneDisplay}
          </a>
          <a
            href={`mailto:${BUSINESS.email}`}
            className="inline-flex items-center gap-1.5 hover:text-gold"
          >
            <Mail className="size-3.5" />
            {BUSINESS.email}
          </a>
        </div>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const { openSearch, openInquiry, openFavorites } = useOverlays();
  const fav = useFavorites();
  const [compact, setCompact] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const measure = () =>
      document.documentElement.style.setProperty(
        "--header-h",
        `${header.getBoundingClientRect().height}px`,
      );
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    measure();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openSearch();
      }
      if (e.key === "Escape") setMegaOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openSearch]);

  const enter = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMegaOpen(true), 120);
  };
  const leave = () => {
    closeTimer.current = setTimeout(() => setMegaOpen(false), 220);
  };

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  return (
    <>
      <AnnouncementBar />
      <header
        ref={headerRef}
        className={cn(
          "sticky top-0 z-40 border-b border-border bg-header-main transition-shadow",
          compact && "shadow-soft",
        )}
      >
        <div
          className={cn(
            "container-site relative flex items-center gap-2 transition-[height] duration-300 xl:gap-4",
            compact ? "h-16" : "h-[72px] lg:h-20",
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            type="button"
            className="-ml-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-olive lg:hidden"
            onClick={() => setDrawer(true)}
            aria-label="Open menu"
          >
            <Menu className="size-6" />
          </Button>
          <Link
            to="/"
            aria-label={`${BUSINESS.name} - home`}
            className="absolute left-1/2 -translate-x-1/2 shrink-0 md:static md:translate-x-0"
          >
            <Logo variant="header" priority />
          </Link>

          <nav aria-label="Main" className="hidden shrink-0 items-center lg:flex">
            {PRIMARY_NAV.slice(0, 4).map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="group relative inline-flex h-11 items-center whitespace-nowrap px-2 text-xs font-medium text-slate transition-colors duration-300 hover:text-olive xl:px-3 xl:text-sm"
                activeProps={{ className: "text-olive font-semibold" }}
              >
                {n.label}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-3 bottom-1.5 h-px origin-left scale-x-0 bg-olive transition-transform duration-300 group-hover:scale-x-100 group-focus-visible:scale-x-100"
                />
              </Link>
            ))}
          </nav>

          <DesktopHeaderSearch />

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2 lg:ml-0 lg:gap-0 xl:gap-1">
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => openSearch()}
              className="rounded-full text-olive lg:hidden"
              aria-label="Search products"
            >
              <Search className="size-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={openFavorites}
              className="relative hidden h-11 w-11 items-center justify-center rounded-full text-olive hover:bg-muted md:inline-flex"
              aria-label={`Favourites (${fav.list.length})`}
            >
              <Heart className="size-5" />
              {fav.list.length > 0 && (
                <span className="absolute right-1.5 top-1.5 min-w-4 rounded-full bg-terracotta px-1 text-center text-[0.6rem] font-bold leading-4 text-primary-foreground">
                  {fav.list.length}
                </span>
              )}
            </Button>
            <a
              href={whatsappUrl({ kind: "general" })}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-11 w-11 items-center justify-center rounded-full text-whatsapp-ink transition-colors duration-300 hover:bg-whatsapp/10 md:inline-flex lg:hidden xl:inline-flex"
              aria-label="Chat on WhatsApp"
            >
              <WhatsAppIcon className="size-5" />
            </a>
            <Button onClick={() => openInquiry()} className="hidden px-3 md:inline-flex xl:px-5">
              Enquire now
            </Button>
          </div>
        </div>
        <DesktopCategoryNav
          open={megaOpen}
          onToggle={() => {
            clearTimeout(closeTimer.current);
            setMegaOpen((o) => !o);
          }}
          onEnter={enter}
          onLeave={leave}
          onNavigate={() => setMegaOpen(false)}
        />
        <div id="mega-menu" onMouseEnter={enter} onMouseLeave={leave}>
          <MegaMenu open={megaOpen} onNavigate={() => setMegaOpen(false)} />
        </div>
      </header>
      <MobileNavDrawer open={drawer} onOpenChange={setDrawer} />
    </>
  );
}
