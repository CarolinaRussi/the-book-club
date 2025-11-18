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
