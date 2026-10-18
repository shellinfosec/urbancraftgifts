import { LOGO_ASSETS } from "@/config/brand";
import { cn } from "@/lib/utils";

/** A restrained version of the supplied seal-ring loader; no simulated progress. */
export function BrandLoader({ className }: { className?: string }) {
  return (
    <span role="status" aria-label="Loading image" className={cn("brand-loader", className)}>
      <svg className="brand-loader-ring" viewBox="0 0 64 64" aria-hidden="true">
        <circle className="brand-loader-track" cx="32" cy="32" r="29" />
        <circle className="brand-loader-arc" cx="32" cy="32" r="29" />
      </svg>
      <img src={LOGO_ASSETS.outline.src} alt="" aria-hidden="true" width={38} height={38} />
    </span>
  );
}
