export const BOOK_STATUS_VALUES = [
  "suggested",
  "started",
  "dropped",
  "finished",
] as const;

export type BookStatus = (typeof BOOK_STATUS_VALUES)[number];

export const BOOK_STATUS_SUGGESTED: BookStatus = "suggested";
export const BOOK_STATUS_STARTED: BookStatus = "started";
export const BOOK_STATUS_DROPPED: BookStatus = "dropped";
export const BOOK_STATUS_FINISHED: BookStatus = "finished";

export const bookStatusLabels: Record<BookStatus, string> = {
  [BOOK_STATUS_SUGGESTED]: "Sugerido",
  [BOOK_STATUS_STARTED]: "Leitura Atual",
  [BOOK_STATUS_DROPPED]: "Abandonado",
  [BOOK_STATUS_FINISHED]: "Finalizado",
};

export function getBookStatusBadgeLabel(
  status: BookStatus,
  suggestedBy?: { name: string; nickname: string } | null,
): string {
  if (status === BOOK_STATUS_SUGGESTED && suggestedBy) {
    const who =
      suggestedBy.nickname?.trim() ||
      suggestedBy.name?.trim().split(/\s+/)[0] ||
      "";
    return who ? `Sugerido por ${who}` : bookStatusLabels[BOOK_STATUS_SUGGESTED];
  }
  return bookStatusLabels[status];
}
