import { BookStatus } from "../enums/bookStatus";
import { ClubStatus } from "../enums/clubStatus";
import { UserStatus } from "../enums/userStatus";

export const REVIEW_REMINDER_LOOKBACK_MONTHS = 6;

export type PendingReviewReminderRow = {
  userId: string;
  userName: string;
  userEmail: string;
  clubId: string;
  clubName: string;
  bookId: string;
  bookTitle: string;
};

export type ReviewReminderDigestClub = {
  clubId: string;
  clubName: string;
  books: Array<{ bookId: string; title: string }>;
};

export type ReviewReminderDigest = {
  userId: string;
  userName: string;
  userEmail: string;
  clubs: ReviewReminderDigestClub[];
};

export type ReviewReminderEligibilityInput = {
  clubBookStatus: string;
  deletedAt: Date | null;
  finishedAt: Date | null;
  joinedAt: Date;
  userStatus: string;
  clubStatus: string;
  rating: number | null;
  now?: Date;
};

export function isEligibleReviewReminder(
  input: ReviewReminderEligibilityInput,
): boolean {
  if (input.clubBookStatus !== BookStatus.FINISHED) return false;
  if (input.deletedAt) return false;
  if (input.userStatus !== UserStatus.ACTIVE) return false;
  if (input.clubStatus !== ClubStatus.ACTIVE) return false;
  if (input.rating !== null) return false;
  if (!input.finishedAt) return false;

  const now = input.now ?? new Date();
  const windowStart = new Date(now);
  windowStart.setMonth(
    windowStart.getMonth() - REVIEW_REMINDER_LOOKBACK_MONTHS,
  );

  if (input.finishedAt < windowStart) return false;
  if (input.finishedAt < input.joinedAt) return false;
  return true;
}

export function groupPendingReviewReminderRows(
  rows: PendingReviewReminderRow[],
): ReviewReminderDigest[] {
  const digestsByUserId = new Map<string, ReviewReminderDigest>();

  for (const row of rows) {
    let digest = digestsByUserId.get(row.userId);
    if (!digest) {
      digest = {
        userId: row.userId,
        userName: row.userName,
        userEmail: row.userEmail,
        clubs: [],
      };
      digestsByUserId.set(row.userId, digest);
    }

    let clubSection = digest.clubs.find(
      (club) => club.clubId === row.clubId,
    );
    if (!clubSection) {
      clubSection = {
        clubId: row.clubId,
        clubName: row.clubName,
        books: [],
      };
      digest.clubs.push(clubSection);
    }

    if (
      !clubSection.books.some((bookItem) => bookItem.bookId === row.bookId)
    ) {
      clubSection.books.push({
        bookId: row.bookId,
        title: row.bookTitle,
      });
    }
  }

  return [...digestsByUserId.values()];
}
