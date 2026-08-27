export const ReadingDrawStatus = {
  NOMINATING: "nominating",
  AWAITING_BOOK: "awaiting_book",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
} as const;

export type ReadingDrawStatusValue =
  (typeof ReadingDrawStatus)[keyof typeof ReadingDrawStatus];
