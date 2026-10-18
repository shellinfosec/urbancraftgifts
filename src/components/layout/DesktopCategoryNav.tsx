import { useLayoutEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen, ChevronDown, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requireCategory } from "@/config/categories";
import {
  HEADER_CATEGORIES_LABEL,
  HEADER_CATEGORY_SLUGS,
  HEADER_SECONDARY_LINKS,
} from "@/config/navigation";
import { cn } from "@/lib/utils";

const categories = HEADER_CATEGORY_SLUGS.map(requireCategory);
const linkClass =
  "inline-flex h-12 shrink-0 items-center whitespace-nowrap px-3 text-xs font-medium";

export function DesktopCategoryNav({
  open,
  onToggle,
  onEnter,
  onLeave,
  onNavigate,
}: {
  open: boolean;
  onToggle: () => void;
  onEnter: () => void;
  onLeave: () => void;
  onNavigate: () => void;
}) {
  const rail = useRef<HTMLDivElement>(null);
  const measure = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(categories.length);

  useLayoutEffect(() => {
    const element = rail.current;
    const measurement = measure.current;
    if (!element || !measurement) return;
    const update = () => {
      if (!element.clientWidth) return;
      let width = 0;
      let fit = 0;
      for (const child of measurement.children) {
        width += child.getBoundingClientRect().width;
        if (width > element.clientWidth) break;
        fit += 1;
      }
      setCount(fit > 0 ? fit : categories.length);
    };
    const observer = new ResizeObserver(update);
    observer.observe(element);
    observer.observe(measurement);
    update();
    return () => observer.disconnect();
  }, []);

  return (
    <div className="hidden border-t border-border/70 bg-header-category lg:block">
      <nav aria-label="Product categories" className="container-site flex h-12 items-center gap-5">
        <div
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          className="shrink-0 border-r border-border pr-5"
        >
          <Button
            variant="ghost"
            onClick={onToggle}
            aria-expanded={open}
            aria-controls="mega-menu"
            className="h-10 gap-2.5 rounded-lg px-2 text-olive"
          >
            <LayoutGrid /> {HEADER_CATEGORIES_LABEL}
            <ChevronDown
              className={cn("transition-transform duration-300", open && "rotate-180")}
            />
          </Button>
        </div>
        <div ref={rail} className="relative flex min-w-0 flex-1 items-center overflow-hidden">
          <div
            ref={measure}
            aria-hidden="true"
            className="pointer-events-none invisible absolute flex w-max"
          >
            {categories.map((c) => (
              <span key={c.slug} className={linkClass}>
                {c.shortName}
              </span>
            ))}
          </div>
          {categories.slice(0, count).map((c) => (
            <Link
              key={c.slug}
              to="/categories/$slug"
              params={{ slug: c.slug }}
              onClick={onNavigate}
              className={cn(
                linkClass,
                "group relative text-slate transition-colors duration-300 hover:text-olive",
              )}
              activeProps={{ className: "text-olive font-semibold" }}
            >
              {c.shortName}
              <span
                aria-hidden="true"
                className="absolute inset-x-3 bottom-2 h-px origin-left scale-x-0 bg-olive transition-transform duration-300 group-hover:scale-x-100 group-focus-visible:scale-x-100"
              />
            </Link>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {HEADER_SECONDARY_LINKS.map((link) => (
            <Button
              key={link.to}
              asChild
              variant="brown"
              size="sm"
              className="rounded-full px-3.5 transition-colors"
            >
              <Link
                to={link.to}
                onClick={onNavigate}
                className="inline-flex items-center gap-1.5"
                activeProps={{ className: "!bg-olive !border-olive text-white font-semibold" }}
              >
                {"icon" in link && link.icon === "book" && (
                  <BookOpen className="size-3.5 text-gold shrink-0" />
                )}
                <span>{link.label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </nav>
    </div>
  );
}
