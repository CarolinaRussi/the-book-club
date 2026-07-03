interface ProfileSectionHeadingProps {
  title: string;
  description?: string;
  id?: string;
}

export default function ProfileSectionHeading({
  title,
  description,
  id,
}: ProfileSectionHeadingProps) {
  return (
    <div id={id} className="scroll-mt-24 border-b border-border/60 pb-3">
      <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
