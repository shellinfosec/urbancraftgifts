import { useCallback, useEffect, useState, type ImgHTMLAttributes } from "react";
import { ImageOff } from "lucide-react";
import { BrandLoader } from "@/components/brand/BrandLoader";
import { cn } from "@/lib/utils";

type Props = ImgHTMLAttributes<HTMLImageElement> & { imgClassName?: string };

/** Reserve the image's layout, show a mark only for slow loads, never hide cached images. */
export function BrandImage({
  src,
  alt = "",
  className,
  imgClassName,
  onLoad,
  onError,
  ...props
}: Props) {
  const [settledSrc, setSettledSrc] = useState<string>();
  const [failedSrc, setFailedSrc] = useState<string>();
  const [loaderSrc, setLoaderSrc] = useState<string>();
  const settled = settledSrc === src;
  const failed = failedSrc === src && !!src;
  const imageRef = useCallback(
    (image: HTMLImageElement | null) => {
      if (image?.complete && image.naturalWidth > 0) setSettledSrc(src);
    },
    [src],
  );

  useEffect(() => {
    if (settled || !src) return;
    const timer = window.setTimeout(() => setLoaderSrc(src), 180);
    return () => window.clearTimeout(timer);
  }, [src, settled]);

  return (
    <span
      className={cn("brand-image relative block overflow-hidden", className)}
      data-loading={!settled}
    >
      <img
        {...props}
        src={src}
        alt={alt}
        ref={imageRef}
        className={cn("block h-full w-full object-contain", failed && "invisible", imgClassName)}
        onLoad={(event) => {
          setSettledSrc(src);
          onLoad?.(event);
        }}
        onError={(event) => {
          setFailedSrc(src);
          setSettledSrc(src);
          onError?.(event);
        }}
      />
      {!settled && loaderSrc === src && (
        <span
          className="pointer-events-none absolute inset-0 grid place-items-center"
          aria-hidden={alt === "" || undefined}
        >
          <BrandLoader />
        </span>
      )}
      {failed && (
        <span
          role="img"
          aria-label={alt ? `${alt} - image unavailable` : "Image unavailable"}
          className="absolute inset-0 grid place-items-center text-muted-foreground"
        >
          <ImageOff className="size-5" />
        </span>
      )}
    </span>
  );
}
