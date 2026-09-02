import { cn } from "@/lib/utils";

type LandingFeatureImage = {
  src: string;
  alt: string;
};

type LandingFeatureRowProps = {
  title: string;
  description: string;
  images?: LandingFeatureImage[];
  reverse?: boolean;
};

export default function LandingFeatureRow({
  title,
  description,
  images,
  reverse = false,
}: LandingFeatureRowProps) {
  const hasImages = !!images && images.length > 0;

  return (
    <div
      className={cn(
        "mx-auto flex max-w-5xl flex-col items-center gap-8 lg:gap-12",
        reverse ? "lg:flex-row-reverse" : "lg:flex-row"
      )}
    >
      <div className="flex-1 text-center lg:text-left">
        <h3 className="text-xl font-bold text-foreground sm:text-2xl">{title}</h3>
        <p className="mt-3 text-pretty text-base text-warm-brown sm:text-lg">
          {description}
        </p>
      </div>

      <div className="w-full flex-1">
        {hasImages ? (
          <div className="flex flex-col gap-3">
            {images.map((image) => (
              <img
                key={image.src}
                src={image.src}
                alt={image.alt}
                loading="lazy"
                className="w-full rounded-lg border border-border object-cover shadow-md"
              />
            ))}
          </div>
        ) : (
          <div
            role="img"
            aria-label={`${title}: print em breve`}
            className="flex aspect-[4/3] w-full items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/60 px-4 text-center"
          >
            <span className="text-sm text-muted-foreground">
              Print em breve: {title}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
