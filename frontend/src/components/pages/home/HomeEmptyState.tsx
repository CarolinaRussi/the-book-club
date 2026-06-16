import type { ReactNode } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HomeEmptyStateProps = {
  icon?: ReactNode;
  message: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
  className?: string;
};

export default function HomeEmptyState({
  icon,
  message,
  actionLabel,
  actionTo,
  onAction,
  className,
}: HomeEmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-border p-6 md:p-8 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="mb-3 flex justify-center text-muted-foreground">{icon}</div>
      ) : null}
      <p className="text-sm md:text-base text-muted-foreground">{message}</p>
      {actionLabel && actionTo ? (
        <Button variant="link" className="mt-2" asChild>
          <Link to={actionTo}>{actionLabel}</Link>
        </Button>
      ) : null}
      {actionLabel && onAction ? (
        <Button variant="link" className="mt-2" type="button" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
