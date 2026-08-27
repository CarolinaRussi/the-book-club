import type {
  ReadingDrawCreateMode,
  ReadingDrawMode,
  ReadingDrawStatus,
} from "@/types/IReadingDraw";

export const READING_DRAW_MODE_DIRECT =
  "direct" as const satisfies ReadingDrawMode;
export const READING_DRAW_MODE_LAST_STANDING =
  "last_standing" as const satisfies ReadingDrawMode;
export const READING_DRAW_MODE_VOTE = "vote" as const satisfies ReadingDrawMode;

export const READING_DRAW_STATUS_NOMINATING =
  "nominating" as const satisfies ReadingDrawStatus;
export const READING_DRAW_STATUS_AWAITING_BOOK =
  "awaiting_book" as const satisfies ReadingDrawStatus;
export const READING_DRAW_STATUS_COMPLETED =
  "completed" as const satisfies ReadingDrawStatus;
export const READING_DRAW_STATUS_CANCELLED =
  "cancelled" as const satisfies ReadingDrawStatus;
export const READING_DRAW_STATUS_EXPIRED =
  "expired" as const satisfies ReadingDrawStatus;

export const readingDrawStatusLabels: Record<ReadingDrawStatus, string> = {
  nominating: "Indicações",
  awaiting_book: "Aguardando livro",
  completed: "Concluído",
  cancelled: "Cancelado",
  expired: "Expirado",
};

export const readingDrawModeLabels: Record<
  ReadingDrawCreateMode,
  { title: string; description: string }
> = {
  direct: {
    title: "Sorteio direto",
    description: "Um clique e sai o livro vencedor entre as indicações.",
  },
  last_standing: {
    title: "Sobra um",
    description: "Elimina um livro por vez até sobrar só um.",
  },
  vote: {
    title: "Votação",
    description: "Participantes votam; empate abre nova rodada só com os empatados.",
  },
};

export const READING_DRAW_MULTI_VOTE_OPTIONS = [2, 3, 4, 5] as const;

export function isReadingDrawLiveStatus(status: ReadingDrawStatus): boolean {
  return (
    status === READING_DRAW_STATUS_NOMINATING ||
    status === READING_DRAW_STATUS_AWAITING_BOOK
  );
}
