import { useEffect, useMemo, useRef, useState } from "react";
import type { IReadingDrawNomination } from "@/types/IReadingDraw";
import ReadingDrawGeneratedCover, {
  coverAccentIndex,
} from "./ReadingDrawGeneratedCover";
import { cn } from "@/lib/utils";

export const READING_DRAW_ELIMINATION_DURATION_MS = 5500;

type ReadingDrawEliminationBeatProps = {
  eliminated: IReadingDrawNomination;
  remaining: IReadingDrawNomination[];
  eliminatedAt: string;
  onFinished: () => void;
};

type Phase = "sweep" | "strike" | "gone";

function createSeededRandom(seed: string) {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return () => {
    hash += 0x6d2b79f5;
    let value = Math.imul(hash ^ (hash >>> 15), 1 | hash);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function buildEliminationSweepPath(
  bookCount: number,
  victimIndex: number,
  seed: string,
): number[] {
  const random = createSeededRandom(seed);
  const path: number[] = [];
  for (let step = 0; step < 14; step += 1) {
    path.push(Math.floor(random() * bookCount));
  }
  const neighbor = (victimIndex + 1) % bookCount;
  path.push(neighbor, victimIndex, neighbor, victimIndex);
  return path;
}

export default function ReadingDrawEliminationBeat({
  eliminated,
  remaining,
  eliminatedAt,
  onFinished,
}: ReadingDrawEliminationBeatProps) {
  const shelfBooks = useMemo(
    () =>
      [...remaining, eliminated].sort((left, right) =>
        left.id.localeCompare(right.id),
      ),
    [remaining, eliminated],
  );

  const victimIndex = Math.max(
    0,
    shelfBooks.findIndex((book) => book.id === eliminated.id),
  );

  const sweepPath = useMemo(
    () =>
      buildEliminationSweepPath(
        Math.max(shelfBooks.length, 1),
        victimIndex,
        `${eliminated.id}:${eliminatedAt}`,
      ),
    [eliminated.id, eliminatedAt, shelfBooks.length, victimIndex],
  );

  const [phase, setPhase] = useState<Phase>("sweep");
  const [sweepStep, setSweepStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;

  const highlightedIndex =
    phase === "sweep" ? sweepPath[sweepStep] ?? victimIndex : victimIndex;

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
    let step = 0;
    let sweepTimer: number | undefined;
    let strikeTimer: number | undefined;
    let goneTimer: number | undefined;

    const tickSweep = () => {
      step += 1;
      if (step >= sweepPath.length) {
        setPhase("strike");
        strikeTimer = window.setTimeout(() => {
          setPhase("gone");
          goneTimer = window.setTimeout(() => {
            finish();
          }, 900);
        }, 700);
        return;
      }
      setSweepStep(step);
      const progress = step / sweepPath.length;
      const delay = 70 + progress * 110;
      sweepTimer = window.setTimeout(tickSweep, delay);
    };

    sweepTimer = window.setTimeout(tickSweep, 280);

    return () => {
      window.clearTimeout(fadeIn);
      window.clearTimeout(sweepTimer);
      window.clearTimeout(strikeTimer);
      window.clearTimeout(goneTimer);
    };
  }, [eliminatedAt, sweepPath]);

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
        {phase === "sweep"
          ? "A prateleira escolhe quem sai…"
          : phase === "strike"
            ? "Fora!"
            : "Um a menos"}
      </p>

      <div className="mx-auto flex min-h-48 max-w-xl flex-col items-center justify-end">
        <div className="flex items-end justify-center gap-1.5 sm:gap-2">
          {shelfBooks.map((book, index) => {
            const isVictim = book.id === eliminated.id;
            const isHighlighted = index === highlightedIndex;
            const hideVictim = isVictim && phase === "gone";
            return (
              <div
                key={book.id}
                className={cn(
                  "transition-all duration-300",
                  hideVictim && "w-0 scale-0 opacity-0 duration-700",
                  isVictim &&
                    phase === "strike" &&
                    "scale-110 opacity-40 grayscale",
                  phase === "sweep" &&
                    isHighlighted &&
                    "z-10 scale-110",
                )}
              >
                {!hideVictim ? (
                  <ReadingDrawGeneratedCover
                    title={book.title}
                    author={book.author}
                    accentIndex={coverAccentIndex(book.id)}
                    variant="spine"
                    highlighted={
                      (phase === "sweep" && isHighlighted) ||
                      (isVictim && phase === "strike")
                    }
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

      {phase !== "sweep" ? (
        <p className="mt-4 text-center text-base font-semibold text-foreground">
          Eliminado: {eliminated.title}
        </p>
      ) : null}
    </div>
  );
}
