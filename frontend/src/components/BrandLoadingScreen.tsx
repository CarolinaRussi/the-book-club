import { GiBookCover } from "react-icons/gi";
import { cn } from "@/lib/utils";

type BrandLoadingScreenProps = {
  className?: string;
  label?: string;
};

export default function BrandLoadingScreen({
  className,
  label = "Carregando…",
}: BrandLoadingScreenProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn(
        "flex min-h-[min(70vh,32rem)] w-full flex-col items-center justify-center gap-4 px-6 py-16 text-center",
        className,
      )}
    >
      <GiBookCover
        className="brand-loading-icon h-16 w-16 text-primary sm:h-20 sm:w-20"
        aria-hidden
      />
      <p className="brand-loading-title text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Entrelivros
      </p>
      <p className="brand-loading-subtitle text-sm text-muted-foreground sm:text-base">
        {label}
      </p>
    </div>
  );
}
