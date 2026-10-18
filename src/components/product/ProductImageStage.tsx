import { BrandImage } from "@/components/common/BrandImage";
import type { StageTone } from "@/config/categories";
import { cn } from "@/lib/utils";

export const STAGE_TONE: Record<StageTone, string> = {
  ivory: "bg-stage-ivory",
  sand: "bg-stage-sand",
  sage: "bg-stage-sage",
  rose: "bg-stage-rose",
  gold: "bg-stage-gold",
  stone: "bg-stage-stone",
};

interface Props {
  src: string;
  alt: string;
  tone?: StageTone | undefined;
  className?: string | undefined;
  imgClassName?: string | undefined;
  priority?: boolean | undefined;
  sizes?: string | undefined;
}

/** Square stage for transparent 1:1 cutouts. Always object-contain; never crops or distorts. */
export function ProductImageStage({
  src,
  alt,
  tone = "ivory",
  className,
  imgClassName,
  priority,
}: Props) {
  return (
    <div className={cn("relative aspect-square overflow-hidden", STAGE_TONE[tone], className)}>
      <div aria-hidden className="stage-glow absolute inset-0" />
      <BrandImage
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        width={800}
        height={800}
        className="relative h-full w-full"
        imgClassName={cn(
          "object-contain p-[9%] transition-transform duration-500 ease-out",
          imgClassName,
        )}
      />
    </div>
  );
}
