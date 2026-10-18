import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOverlays } from "@/components/providers/OverlayProvider";
import { HEADER_SEARCH_SUGGESTIONS } from "@/config/navigation";

export function DesktopHeaderSearch() {
  const { openSearch } = useOverlays();
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [length, setLength] = useState(HEADER_SEARCH_SUGGESTIONS[0].length);
  const [erasing, setErasing] = useState(false);
  const [paused, setPaused] = useState(false);
  const term = HEADER_SEARCH_SUGGESTIONS[index] ?? HEADER_SEARCH_SUGGESTIONS[0];

  useEffect(() => {
    if (reducedMotion || paused) return;
    const full = length === term.length;
    const timer = setTimeout(
      () => {
        if (!erasing && full) setErasing(true);
        else if (erasing && length === 0) {
          setIndex((i) => (i + 1) % HEADER_SEARCH_SUGGESTIONS.length);
          setErasing(false);
        } else setLength((n) => n + (erasing ? -1 : 1));
      },
      !erasing && full ? 3200 : erasing ? 40 : 85,
    );
    return () => clearTimeout(timer);
  }, [reducedMotion, paused, length, term, erasing]);

  return (
    <Button
      variant="ghost"
      onClick={() => openSearch()}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-label="Search products"
      className="group hidden min-w-0 flex-1 justify-start gap-2.5 rounded-lg border border-border bg-card px-3 text-sm font-normal text-muted-foreground transition-[border-color,box-shadow,background-color] duration-300 hover:border-olive/40 hover:bg-card hover:shadow-soft lg:flex"
    >
      <Search className="text-olive transition-transform duration-300 group-hover:scale-110" />
      <span aria-hidden="true" className="min-w-0 flex-1 truncate text-left">
        Search{" "}
        <span className="text-slate">
          {reducedMotion ? HEADER_SEARCH_SUGGESTIONS[0] : term.slice(0, length)}
        </span>
        <span className="ml-0.5 inline-block h-3.5 border-r border-olive/45 align-middle" />
      </span>
    </Button>
  );
}
