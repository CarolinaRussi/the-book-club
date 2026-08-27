import type {
  ReadingDrawMode,
  ReadingDrawStatus,
} from "@/types/IReadingDraw";

export const READING_DRAW_MODE_DIRECT = "direct" as const satisfies ReadingDrawMode;

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

export function isReadingDrawLiveStatus(status: ReadingDrawStatus): boolean {
  return (
    status === READING_DRAW_STATUS_NOMINATING ||
    status === READING_DRAW_STATUS_AWAITING_BOOK
  );
}
