import { and, eq, gte, isNotNull, isNull, notExists, sql } from "drizzle-orm";
import { db } from "../db/client";
import { book, club, clubBook, member, review, user } from "../db/schema";
import { BookStatus } from "../enums/bookStatus";
import { ClubStatus } from "../enums/clubStatus";
import { UserStatus } from "../enums/userStatus";
import {
  REVIEW_REMINDER_LOOKBACK_MONTHS,
  type PendingReviewReminderRow,
} from "../services/reviewReminderDigest";

export async function findPendingReviewReminderRows(): Promise<
  PendingReviewReminderRow[]
> {
  const ratedReview = db
    .select({ one: sql`1` })
    .from(review)
    .where(
      and(
        eq(review.userId, user.id),
        eq(review.bookId, book.id),
        isNotNull(review.rating),
      ),
    );

  return db
    .select({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      clubId: club.id,
      clubName: club.name,
      bookId: book.id,
      bookTitle: book.title,
    })
    .from(clubBook)
    .innerJoin(club, eq(club.id, clubBook.clubId))
    .innerJoin(book, eq(book.id, clubBook.bookId))
    .innerJoin(member, eq(member.clubId, club.id))
    .innerJoin(user, eq(user.id, member.userId))
    .where(
      and(
        eq(clubBook.status, BookStatus.FINISHED),
        isNull(clubBook.deletedAt),
        isNotNull(clubBook.finishedAt),
        eq(club.status, ClubStatus.ACTIVE),
        eq(user.status, UserStatus.ACTIVE),
        gte(clubBook.finishedAt, member.joinedAt),
        sql`${clubBook.finishedAt} >= now() - interval '1 month' * ${REVIEW_REMINDER_LOOKBACK_MONTHS}`,
        notExists(ratedReview),
      ),
    )
    .orderBy(user.id, club.name, book.title);
}
