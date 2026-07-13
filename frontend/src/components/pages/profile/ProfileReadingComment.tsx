import { useState } from "react";
import { cn } from "@/lib/utils";

const REVIEW_COLLAPSE_THRESHOLD = 140;

interface ProfileReadingCommentProps {
  comment?: string | null;
  mode?: "fixed-clamp" | "expandable";
}

export default function ProfileReadingComment({
  comment,
  mode = "fixed-clamp",
}: ProfileReadingCommentProps) {
  const [expanded, setExpanded] = useState(false);
  const text = comment?.trim();

  if (!text) {
    return (
      <p className="mb-3 text-sm text-muted-foreground italic">Sem comentário</p>
    );
  }

  const needsExpand =
    mode === "expandable" && text.length > REVIEW_COLLAPSE_THRESHOLD;

  return (
    <div className="mb-3">
      <p
        className={cn(
          "text-sm text-muted-foreground whitespace-pre-wrap wrap-break-word",
          mode === "fixed-clamp" && "line-clamp-2 md:line-clamp-4",
          needsExpand && !expanded && "line-clamp-2 md:line-clamp-3",
        )}
      >
        &ldquo;{text}&rdquo;
      </p>
      {needsExpand ? (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-1 text-xs font-medium text-primary cursor-pointer hover:underline"
        >
          {expanded ? "Ver menos" : "Ler review completa"}
        </button>
      ) : null}
    </div>
  );
}
