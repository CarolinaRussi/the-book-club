import { alias } from "drizzle-orm/pg-core";
import { and, asc, count, desc, eq, exists, inArray, isNull, sql } from "drizzle-orm";
import { db } from "../db/client";
import {
  book,
  club,
  clubBook,
  member,
  review,
  user,
  userBook,
} from "../db/schema";
import { ReadingStatus } from "../enums/readingStatus";
import { UserStatus } from "../enums/userStatus";

const mViewer = alias(member, "m_viewer");
const mActor = alias(member, "m_actor");

function sharedClubBookExists(viewerUserId: string) {
  return exists(
    db
      .select({ one: sql`1` })
      .from(mViewer)
      .innerJoin(mActor, eq(mViewer.clubId, mActor.clubId))
      .innerJoin(
        clubBook,
        and(
          eq(clubBook.clubId, mViewer.clubId),
          eq(clubBook.bookId, userBook.bookId)
        )
      )
      .where(
        and(
          eq(mViewer.userId, viewerUserId),
          eq(mActor.userId, userBook.userId),
          isNull(clubBook.deletedAt)
        )
      )
  );
}

const finishedFeedFilter = (viewerUserId: string) =>
  and(
    eq(userBook.readingStatus, ReadingStatus.FINISHED),
    eq(user.status, UserStatus.ACTIVE),
    sharedClubBookExists(viewerUserId)
  );

export async function findFinishedBooksFeedPaginated(
  viewerUserId: string,
  offset: number,
  limit: number
) {
  return db
    .select({
      userBookId: userBook.id,
      updatedAt: userBook.updatedAt,
      readingStatus: userBook.readingStatus,
      actorId: user.id,
      actorName: user.name,
      actorNickname: user.nickname,
      actorProfilePicture: user.profilePicture,
      bookId: book.id,
      bookTitle: book.title,
      bookAuthor: book.author,
      bookCoverUrl: book.coverUrl,
      rating: review.rating,
      comment: review.comment,
    })
    .from(userBook)
    .innerJoin(user, eq(userBook.userId, user.id))
    .innerJoin(book, eq(userBook.bookId, book.id))
    .leftJoin(
      review,
      and(eq(review.userId, userBook.userId), eq(review.bookId, userBook.bookId))
    )
    .where(finishedFeedFilter(viewerUserId))
    .orderBy(desc(userBook.updatedAt))
    .limit(limit)
    .offset(offset);
}

export async function countFinishedBooksFeed(viewerUserId: string) {
  const [row] = await db
    .select({ value: count() })
    .from(userBook)
    .innerJoin(user, eq(userBook.userId, user.id))
    .where(finishedFeedFilter(viewerUserId));

  return Number(row?.value ?? 0);
}

export async function findViewerClubsForBookIds(
  viewerUserId: string,
  bookIds: string[]
) {
  if (bookIds.length === 0) return [];

  return db
    .select({
      bookId: clubBook.bookId,
      clubId: club.id,
      clubName: club.name,
    })
    .from(member)
    .innerJoin(
      clubBook,
      and(
        eq(clubBook.clubId, member.clubId),
        inArray(clubBook.bookId, bookIds),
        isNull(clubBook.deletedAt)
      )
    )
    .innerJoin(club, eq(club.id, member.clubId))
    .where(eq(member.userId, viewerUserId))
    .orderBy(asc(club.name));
}
