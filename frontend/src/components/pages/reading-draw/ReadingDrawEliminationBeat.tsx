import { useEffect, useRef, useState } from "react";
import type { IReadingDrawNomination } from "@/types/IReadingDraw";
import ReadingDrawGeneratedCover, {
  coverAccentIndex,
} from "./ReadingDrawGeneratedCover";
import { cn } from "@/lib/utils";

export const READING_DRAW_ELIMINATION_DURATION_MS = 3800;

type ReadingDrawEliminationBeatProps = {
  eliminated: IReadingDrawNomination;
  remaining: IReadingDrawNomination[];
  eliminatedAt: string;
  onFinished: () => void;
};

type Phase = "scan" | "strike" | "gone";

export default function ReadingDrawEliminationBeat({
  eliminated,
  remaining,
  eliminatedAt,
  onFinished,
}: ReadingDrawEliminationBeatProps) {
  const [phase, setPhase] = useState<Phase>("scan");
  const [visible, setVisible] = useState(false);
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;

  const shelfBooks = [...remaining, eliminated];

  useEffect(() => {
    const finishedGuard = { current: false };
    const finish = () => {
      if (finishedGuard.current) return;
      finishedGuard.current = true;
      onFinishedRef.current();
    };

    const elapsed = Date.now() - new Date(eliminatedAt).getTime();
    if (elapsed >= READING_DRAW_ELIMINATION_DURATION_MS) {
      finish();
      return;
    }

    const fadeIn = window.setTimeout(() => setVisible(true), 40);
    const strikeTimer = window.setTimeout(() => setPhase("strike"), 900);
    const goneTimer = window.setTimeout(() => setPhase("gone"), 2000);
    const doneTimer = window.setTimeout(
      () => finish(),
      Math.max(400, READING_DRAW_ELIMINATION_DURATION_MS - elapsed),
    );

    return () => {
      window.clearTimeout(fadeIn);
      window.clearTimeout(strikeTimer);
      window.clearTimeout(goneTimer);
      window.clearTimeout(doneTimer);
    };
  }, [eliminatedAt]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-primary/25 bg-[color-mix(in_oklab,var(--background)_88%,var(--warm-brown))] px-3 py-6 shadow-inner transition-opacity duration-500 sm:px-6",
        visible ? "opacity-100" : "opacity-0",
      )}
      aria-live="polite"
      aria-label="Eliminação de um livro"
    >
      <p className="mb-4 text-center text-sm font-medium text-primary">
        {phase === "scan"
          ? "A prateleira escolhe quem sai…"
          : phase === "strike"
            ? "Fora!"
            : "Um a menos"}
      </p>

      <div className="mx-auto flex min-h-48 max-w-xl flex-col items-center justify-end">
        <div className="flex items-end justify-center gap-1.5 sm:gap-2">
          {shelfBooks.map((book) => {
            const isVictim = book.id === eliminated.id;
            const hideVictim = isVictim && phase === "gone";
            return (
              <div
                key={book.id}
                className={cn(
                  "transition-all duration-700",
                  hideVictim && "w-0 scale-0 opacity-0",
                  isVictim &&
                    phase === "strike" &&
                    "scale-110 opacity-40 grayscale",
                  isVictim && phase === "scan" && "z-10 scale-110",
                )}
              >
                {!hideVictim ? (
                  <ReadingDrawGeneratedCover
                    title={book.title}
                    author={book.author}
                    accentIndex={coverAccentIndex(book.id)}
                    variant="spine"
                    highlighted={isVictim && phase === "scan"}
                    className={cn(
                      isVictim &&
                        phase === "strike" &&
                        "line-through ring-2 ring-destructive",
                    )}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
        <div className="mt-2 h-2 w-full max-w-md rounded-full bg-[color-mix(in_oklab,var(--warm-brown)_55%,black)] shadow-md" />
      </div>

      {phase !== "scan" ? (
        <p className="mt-4 text-center text-base font-semibold text-foreground">
          Eliminado: {eliminated.title}
        </p>
      ) : null}
    </div>
  );
}
