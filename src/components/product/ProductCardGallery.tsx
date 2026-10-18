import { useEffect, useRef, useState } from "react";
import type { StageTone } from "@/config/categories";
import { ProductImageStage } from "./ProductImageStage";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const SWIPE_THRESHOLD = 42;

/**
 * Card-level image gallery for multi-view products.
 * Swipe on touch screens or select a dot on any device; the image opens quick view.
 */
export function ProductCardGallery({
  images,
  name,
  alt,
  tone,
  priority,
  imgClassName,
  onOpen,
}: {
  images: string[];
  name: string;
  alt: string;
  tone?: StageTone | undefined;
  priority?: boolean | undefined;
  imgClassName?: string | undefined;
  onOpen: () => void;
}) {
  const [index, setIndex] = useState(0);
  const start = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const count = images.length;

  // Warm the neighbouring images so swiping feels instant.
  useEffect(() => {
    if (count < 2) return;
    const neighbours = [index - 1, index + 1].filter((i) => i >= 0 && i < count);
    const timers = neighbours.map((i) => {
      const t = window.setTimeout(() => {
        const src = images[i];
        if (src) new Image().src = src;
      }, 350);
      return { t, cancel: () => window.clearTimeout(t) };
    });
    return () => timers.forEach(({ cancel }) => cancel());
  }, [index, count, images]);

  if (count === 0) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          if (!swiped.current) onOpen();
          swiped.current = false;
        }}
        onTouchStart={(e) => {
          const t = e.touches[0];
          if (!t) return;
          start.current = { x: t.clientX, y: t.clientY };
          swiped.current = false;
        }}
        onTouchEnd={(e) => {
          const s = start.current;
          const t = e.changedTouches[0];
          if (!s || !t || count < 2) return;
          const dx = t.clientX - s.x;
          const dy = t.clientY - s.y;
          start.current = null;
          if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.2) {
            swiped.current = true;
            setIndex((i) => (dx < 0 ? (i + 1) % count : (i - 1 + count) % count));
          }
        }}
        className="block w-full touch-pan-y text-left focus-visible:outline-offset-[-2px]"
        aria-label={`View details: ${name}`}
      >
        <ProductImageStage
          key={images[index]}
          src={images[index] ?? ""}
          alt={index === 0 ? alt : `${alt} - view ${index + 1}`}
          tone={tone}
          priority={priority}
          imgClassName={imgClassName}
        />
      </button>
      {count > 1 && (
        <div
          role="group"
          aria-label={`${name} image views`}
          className="absolute inset-x-0 bottom-0 z-[1] flex items-center justify-center"
        >
          {images.map((_, i) => (
            <Button
              key={i}
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Show image ${i + 1} of ${count}: ${name}`}
              aria-pressed={i === index}
              onClick={() => {
                swiped.current = false;
                setIndex(i);
              }}
              className="h-11 w-8 shrink-0 rounded-none p-0 hover:bg-transparent"
            >
              <span
                className={cn(
                  "h-1.5 rounded-full ring-1 ring-card/60 transition-[width,background-color] duration-300 ease-out",
                  i === index ? "w-3.5 bg-olive" : "w-1.5 bg-charcoal/30",
                )}
              />
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
