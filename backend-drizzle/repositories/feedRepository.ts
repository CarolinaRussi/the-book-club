import { alias } from "drizzle-orm/pg-core";
import {
  and,
  asc,
  eq,
  exists,
  inArray,
  isNull,
  sql,
} from "drizzle-orm";
import { db } from "../db/client";
import {
  book,
  club,
  clubBook,
  meeting,
  meetingRecap,
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

const meetingRecapFeedFilter = (viewerUserId: string) =>
  and(
    isNull(meetingRecap.deletedAt),
    eq(user.status, UserStatus.ACTIVE),
    eq(member.userId, viewerUserId)
  );

export async function findFinishedFeedSortKeys(viewerUserId: string) {
  return db
    .select({
      id: userBook.id,
      sortAt: userBook.updatedAt,
    })
    .from(userBook)
    .innerJoin(user, eq(userBook.userId, user.id))
    .where(finishedFeedFilter(viewerUserId));
}

export async function findMeetingRecapFeedSortKeys(viewerUserId: string) {
  return db
    .select({
      id: meetingRecap.id,
      sortAt: meetingRecap.createdAt,
    })
    .from(meetingRecap)
    .innerJoin(meeting, eq(meetingRecap.meetingId, meeting.id))
    .innerJoin(member, eq(member.clubId, meeting.clubId))
    .innerJoin(user, eq(meetingRecap.createdByUserId, user.id))
    .where(meetingRecapFeedFilter(viewerUserId));
}

export async function findFinishedBooksFeedByIds(
  viewerUserId: string,
  userBookIds: string[]
) {
  if (userBookIds.length === 0) return [];

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
    .where(
      and(finishedFeedFilter(viewerUserId), inArray(userBook.id, userBookIds))
    );
}

export async function findMeetingRecapsFeedByIds(
  viewerUserId: string,
  recapIds: string[]
) {
  if (recapIds.length === 0) return [];

  return db
    .select({
      recapId: meetingRecap.id,
      text: meetingRecap.text,
      imageUrl: meetingRecap.imageUrl,
      createdAt: meetingRecap.createdAt,
      updatedAt: meetingRecap.updatedAt,
      actorId: user.id,
      actorName: user.name,
      actorNickname: user.nickname,
      actorProfilePicture: user.profilePicture,
      clubId: club.id,
      clubName: club.name,
      meetingId: meeting.id,
      meetingDate: meeting.meetingDate,
      meetingTime: meeting.meetingTime,
      meetingLocation: meeting.location,
      bookId: book.id,
      bookTitle: book.title,
      bookAuthor: book.author,
      bookCoverUrl: book.coverUrl,
    })
    .from(meetingRecap)
    .innerJoin(meeting, eq(meetingRecap.meetingId, meeting.id))
    .innerJoin(club, eq(meeting.clubId, club.id))
    .innerJoin(member, eq(member.clubId, meeting.clubId))
    .innerJoin(user, eq(meetingRecap.createdByUserId, user.id))
    .leftJoin(book, eq(meeting.bookId, book.id))
    .where(
      and(
        meetingRecapFeedFilter(viewerUserId),
        inArray(meetingRecap.id, recapIds)
      )
    );
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
