import { cn } from "@/lib/utils";

const SPINE_PALETTES = [
  "bg-[color-mix(in_oklab,var(--primary)_88%,black)] text-primary-foreground",
  "bg-[color-mix(in_oklab,var(--warm-brown)_75%,var(--primary))] text-primary-foreground",
  "bg-[color-mix(in_oklab,var(--secondary)_70%,var(--primary))] text-foreground",
  "bg-[color-mix(in_oklab,var(--primary)_55%,var(--warm-brown))] text-primary-foreground",
  "bg-[color-mix(in_oklab,var(--warm-brown)_90%,black)] text-primary-foreground",
];

type ReadingDrawGeneratedCoverProps = {
  title: string;
  author?: string | null;
  accentIndex: number;
  variant: "spine" | "front";
  highlighted?: boolean;
  className?: string;
};

export default function ReadingDrawGeneratedCover({
  title,
  author,
  accentIndex,
  variant,
  highlighted = false,
  className,
}: ReadingDrawGeneratedCoverProps) {
  const palette = SPINE_PALETTES[accentIndex % SPINE_PALETTES.length];

  if (variant === "spine") {
    return (
      <div
        className={cn(
          "relative flex h-36 w-8 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-black/20 shadow-md transition-transform duration-200 sm:h-44 sm:w-10",
          palette,
          highlighted && "z-10 scale-110 ring-2 ring-primary ring-offset-2 ring-offset-background",
          className,
        )}
      >
        <span
          className="max-h-[90%] rotate-180 truncate px-0.5 text-[10px] font-semibold tracking-wide sm:text-xs"
          style={{ writingMode: "vertical-rl" }}
        >
          {title}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex aspect-[2/3] w-40 flex-col justify-between overflow-hidden rounded-md border border-black/15 p-4 shadow-xl sm:w-48",
        palette,
        className,
      )}
    >
      <div className="absolute inset-y-0 left-0 w-2 bg-black/15" />
      <p className="relative z-10 line-clamp-5 text-center text-lg font-bold leading-snug sm:text-xl">
        {title}
      </p>
      {author ? (
        <p className="relative z-10 line-clamp-2 text-center text-xs opacity-90 sm:text-sm">
          {author}
        </p>
      ) : (
        <span />
      )}
    </div>
  );
}

export function coverAccentIndex(seed: string): number {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) | 0;
  }
  return Math.abs(hash) % SPINE_PALETTES.length;
}
