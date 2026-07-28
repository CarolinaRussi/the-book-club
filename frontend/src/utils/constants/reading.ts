export const READING_STATUS_VALUES = [
  "want_to_read",
  "not_started",
  "started",
  "dropped",
  "finished",
] as const;

export type ReadingStatus = (typeof READING_STATUS_VALUES)[number];

export const READING_STATUS_WANT_TO_READ: ReadingStatus = "want_to_read";
export const READING_STATUS_NOT_STARTED: ReadingStatus = "not_started";
export const READING_STATUS_STARTED: ReadingStatus = "started";
export const READING_STATUS_DROPPED: ReadingStatus = "dropped";
export const READING_STATUS_FINISHED: ReadingStatus = "finished";

export const readingStatusLabels: Record<ReadingStatus, string> = {
  [READING_STATUS_WANT_TO_READ]: "Quero Ler",
  [READING_STATUS_NOT_STARTED]: "Não Iniciado",
  [READING_STATUS_STARTED]: "Leitura Atual",
  [READING_STATUS_DROPPED]: "Abandonado",
  [READING_STATUS_FINISHED]: "Finalizado",
};

type BookWithMemberReviews = {
  reviews?: { user: { id: string }; readingStatus: ReadingStatus }[];
};

export function canShowPersonalQueueBookmark(
  book: BookWithMemberReviews,
  userId: string | undefined,
): boolean {
  if (!userId) return false;
  const myReview = book.reviews?.find((review) => review.user.id === userId);
  if (!myReview) return true;
  return myReview.readingStatus === READING_STATUS_WANT_TO_READ;
}
