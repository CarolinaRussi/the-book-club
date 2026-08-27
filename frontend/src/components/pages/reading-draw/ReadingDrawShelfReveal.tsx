import { useEffect, useMemo, useRef, useState } from "react";
import type { IReadingDrawNomination } from "@/types/IReadingDraw";
import ReadingDrawGeneratedCover, {
  coverAccentIndex,
} from "./ReadingDrawGeneratedCover";
import { cn } from "@/lib/utils";

export const READING_DRAW_REVEAL_DURATION_MS = 6200;

type ReadingDrawShelfRevealProps = {
  nominations: IReadingDrawNomination[];
  winnerNominationId: string;
  revealStartedAt: string;
  drawId: string;
  onFinished: () => void;
};

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

function buildSweepPath(
  bookCount: number,
  winnerIndex: number,
  seed: string,
): number[] {
  const random = createSeededRandom(seed);
  const path: number[] = [];
  for (let step = 0; step < 16; step += 1) {
    path.push(Math.floor(random() * bookCount));
  }
  const neighbor = (winnerIndex + 1) % bookCount;
  path.push(neighbor, winnerIndex, neighbor, winnerIndex);
  return path;
}

type Phase = "sweep" | "pull" | "celebrate";

export default function ReadingDrawShelfReveal({
  nominations,
  winnerNominationId,
  revealStartedAt,
  drawId,
  onFinished,
}: ReadingDrawShelfRevealProps) {
  const books = useMemo(
    () => nominations.filter((nomination) => nomination.confirmedAt),
    [nominations],
  );

  const winnerIndex = Math.max(
    0,
    books.findIndex((book) => book.id === winnerNominationId),
  );

  const sweepPath = useMemo(
    () =>
      buildSweepPath(
        Math.max(books.length, 1),
        winnerIndex,
        `${drawId}:${revealStartedAt}:${winnerNominationId}`,
      ),
    [books.length, drawId, revealStartedAt, winnerIndex, winnerNominationId],
  );

  const [phase, setPhase] = useState<Phase>("sweep");
  const [sweepStep, setSweepStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;

  const highlightedIndex =
    phase === "sweep" ? sweepPath[sweepStep] ?? winnerIndex : winnerIndex;
  const winner = books[winnerIndex] ?? books[0];

  useEffect(() => {
    const finishedGuard = { current: false };
    const finish = () => {
      if (finishedGuard.current) return;
      finishedGuard.current = true;
      onFinishedRef.current();
    };

    const elapsed = Date.now() - new Date(revealStartedAt).getTime();
    if (books.length === 0 || elapsed >= READING_DRAW_REVEAL_DURATION_MS) {
      finish();
      return;
    }

    const fadeIn = window.setTimeout(() => setVisible(true), 40);
    let step = 0;
    let sweepTimer: number | undefined;
    let pullTimer: number | undefined;
    let doneTimer: number | undefined;

    const tickSweep = () => {
      step += 1;
      if (step >= sweepPath.length) {
        setPhase("pull");
        pullTimer = window.setTimeout(() => {
          setPhase("celebrate");
          doneTimer = window.setTimeout(() => {
            finish();
          }, 1400);
        }, 900);
        return;
      }
      setSweepStep(step);
      const progress = step / sweepPath.length;
      const delay = 90 + progress * 160;
      sweepTimer = window.setTimeout(tickSweep, delay);
    };

    sweepTimer = window.setTimeout(tickSweep, 280);

    return () => {
      window.clearTimeout(fadeIn);
      window.clearTimeout(sweepTimer);
      window.clearTimeout(pullTimer);
      window.clearTimeout(doneTimer);
    };
  }, [books.length, revealStartedAt, sweepPath]);

  if (books.length === 0 || !winner) {
    return null;
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-primary/25 bg-[color-mix(in_oklab,var(--background)_88%,var(--warm-brown))] px-3 py-6 shadow-inner transition-opacity duration-500 sm:px-6",
        visible ? "opacity-100" : "opacity-0",
      )}
      aria-live="polite"
      aria-label="Animação do sorteio"
    >
      <p className="mb-4 text-center text-sm font-medium text-primary">
        {phase === "sweep"
          ? "A prateleira está escolhendo…"
          : phase === "pull"
            ? "É este!"
            : "Próxima leitura definida"}
      </p>

      <div className="relative mx-auto flex min-h-52 max-w-xl flex-col items-center justify-end">
        <div
          className={cn(
            "flex items-end justify-center gap-1.5 transition-all duration-700 sm:gap-2",
            phase !== "sweep" && "scale-95 opacity-40 blur-[1px]",
          )}
        >
          {books.map((book, index) => (
            <ReadingDrawGeneratedCover
              key={book.id}
              title={book.title}
              author={book.author}
              accentIndex={coverAccentIndex(book.id)}
              variant="spine"
              highlighted={phase === "sweep" && index === highlightedIndex}
            />
          ))}
        </div>

        <div className="mt-2 h-2 w-full max-w-md rounded-full bg-[color-mix(in_oklab,var(--warm-brown)_55%,black)] shadow-md" />

        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 top-2 flex justify-center transition-all duration-700",
            phase === "sweep"
              ? "translate-y-8 scale-50 opacity-0"
              : "translate-y-0 scale-100 opacity-100",
          )}
        >
          <div
            className={cn(
              "transition-transform duration-700",
              phase === "celebrate" && "animate-[shelf-winner-pop_0.7s_ease-out]",
            )}
          >
            <ReadingDrawGeneratedCover
              title={winner.title}
              author={winner.author}
              accentIndex={coverAccentIndex(winner.id)}
              variant="front"
            />
          </div>
        </div>
      </div>

      {phase === "celebrate" ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {Array.from({ length: 12 }).map((_, index) => (
            <span
              key={index}
              className="absolute size-2 rounded-full bg-primary/70"
              style={{
                left: `${8 + ((index * 17) % 84)}%`,
                top: `${10 + ((index * 29) % 50)}%`,
                animation: `shelf-confetti-fall 1.2s ease-out ${index * 0.05}s both`,
              }}
            />
          ))}
        </div>
      ) : null}

      <style>{`
        @keyframes shelf-winner-pop {
          0% { transform: scale(0.85) translateY(12px); }
          60% { transform: scale(1.06) translateY(-4px); }
          100% { transform: scale(1) translateY(0); }
        }
        @keyframes shelf-confetti-fall {
          0% { opacity: 0; transform: translateY(-8px) scale(0.6); }
          30% { opacity: 1; }
          100% { opacity: 0; transform: translateY(48px) scale(1); }
        }
      `}</style>
    </div>
  );
}
