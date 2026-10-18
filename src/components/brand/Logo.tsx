import { HEADER_LOGO_ASSETS, LOGO_ASSETS, type LogoVariant } from "@/config/brand";
import { BUSINESS } from "@/config/business";
import { cn } from "@/lib/utils";
import { BrandLoader } from "./BrandLoader";

interface LogoProps {
  variant?: LogoVariant | "header";
  /** Rendered height in px; width follows the artwork's own ratio. */
  height?: number;
  className?: string;
  decorative?: boolean;
  priority?: boolean;
}

/** Renders a supplied logo asset. Pick variants by surface: light → horizontal, dark → horizontalReversed. */
export function Logo({
  variant = "horizontal",
  height,
  className,
  decorative,
  priority,
}: LogoProps) {
  if (variant === "header")
    return (
      <span
        role={decorative ? undefined : "img"}
        aria-label={decorative ? undefined : BUSINESS.name}
        aria-hidden={decorative || undefined}
        className={cn("inline-flex items-center gap-1.5 select-none", className)}
      >
        <img
          src={HEADER_LOGO_ASSETS.icon}
          alt=""
          width={1884}
          height={2144}
          className="h-[42px] w-auto md:h-[52px]"
          loading="eager"
          decoding="async"
        />
        <img
          src={HEADER_LOGO_ASSETS.wordmark}
          alt=""
          width={3224}
          height={664}
          className="h-[42px] w-auto md:h-[52px]"
          loading="eager"
          decoding="async"
        />
      </span>
    );
  const asset = LOGO_ASSETS[variant];
  return (
    <img
      src={asset.src}
      alt={decorative ? "" : BUSINESS.name}
      aria-hidden={decorative || undefined}
      style={height !== undefined ? { height } : undefined}
      className={cn("w-auto select-none object-contain", className)}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
    />
  );
}

/** Fast contextual loading mark using the outline/icon artwork - never a blocking preloader. */
export function MarkLoader({
  size = 28,
  label = "Loading",
  className,
}: {
  size?: number;
  label?: string;
  className?: string;
}) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn("inline-flex items-center justify-center", className)}
    >
      <span style={{ height: size, width: size }} className="flex items-center justify-center">
        <BrandLoader className="h-full w-full" />
      </span>
    </span>
  );
}
