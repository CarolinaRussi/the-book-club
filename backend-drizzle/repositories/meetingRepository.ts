import { eq, and, inArray, count } from "drizzle-orm";
import { db } from "../db/client";
import { meeting, clubBook, club, book } from "../db/schema";
import { MeetingStatus } from "../enums/meetingStatus";
import { BookStatus } from "../enums/bookStatus";
import { ReadingMode } from "../enums/readingMode";

const pastStatuses = [
  MeetingStatus.COMPLETED,
  MeetingStatus.CANCELLED,
] as const;

export async function findMeetingsWithBookByClubId(clubId: string) {
  return db.query.meeting.findMany({
    where: (m, { eq }) => eq(m.clubId, clubId),
    orderBy: (m, { desc }) => [desc(m.meetingDate), desc(m.meetingTime)],
    columns: {
      id: true,
      status: true,
      location: true,
      description: true,
      meetingDate: true,
      meetingTime: true,
      chapterStart: true,
      chapterEnd: true,
    },
    with: {
      book: {
        columns: {
          id: true,
          title: true,
          author: true,
          coverUrl: true,
        },
      },
    },
  });
}

export async function findPastMeetingsWithBookPaginated(
  clubId: string,
  offset: number,
  limit: number
) {
  return db.query.meeting.findMany({
    where: (m, { eq, and, inArray }) =>
      and(eq(m.clubId, clubId), inArray(m.status, [...pastStatuses])),
    orderBy: (m, { desc }) => [desc(m.meetingDate), desc(m.meetingTime)],
    offset,
    limit,
    columns: {
      id: true,
      status: true,
      location: true,
      description: true,
      meetingDate: true,
      meetingTime: true,
      createdAt: true,
      chapterStart: true,
      chapterEnd: true,
    },
    with: {
      book: {
        columns: {
          id: true,
          title: true,
          author: true,
          coverUrl: true,
        },
      },
    },
  });
}

export async function countPastMeetingsByClubId(clubId: string) {
  const [row] = await db
    .select({ value: count() })
    .from(meeting)
    .where(
      and(
        eq(meeting.clubId, clubId),
        inArray(meeting.status, [...pastStatuses])
      )
    );
  return Number(row?.value ?? 0);
}

export async function findMeetingById(meetingId: string) {
  const [row] = await db
    .select({
      id: meeting.id,
      clubId: meeting.clubId,
    })
    .from(meeting)
    .where(eq(meeting.id, meetingId))
    .limit(1);
  return row ?? null;
}

export async function findMeetingForGoogleCalendar(meetingId: string) {
  return db.query.meeting.findFirst({
    where: (m, { eq }) => eq(m.id, meetingId),
    columns: {
      id: true,
      clubId: true,
      createdByUserId: true,
      location: true,
      meetingDate: true,
      meetingTime: true,
      description: true,
      status: true,
      bookId: true,
      chapterStart: true,
      chapterEnd: true,
      googleEventId: true,
      googleCalendarId: true,
      googleSyncedAt: true,
      googleSyncError: true,
    },
    with: {
      book: { columns: { title: true } },
      club: { columns: { name: true } },
    },
  });
}

export async function updateMeetingGoogleCalendarFields(
  meetingId: string,
  data: {
    googleEventId?: string | null;
    googleCalendarId?: string | null;
    googleSyncedAt?: Date | null;
    googleSyncError?: string | null;
  },
) {
  const [row] = await db
    .update(meeting)
    .set(data)
    .where(eq(meeting.id, meetingId))
    .returning();
  return row ?? null;
}

export async function findClubReadingModeById(clubId: string) {
  const [row] = await db
    .select({ readingMode: club.readingMode })
    .from(club)
    .where(eq(club.id, clubId))
    .limit(1);
  return (row?.readingMode as (typeof ReadingMode)[keyof typeof ReadingMode]) ?? null;
}

export async function findBookById(bookId: string) {
  const [row] = await db
    .select({
      id: book.id,
      totalChapters: book.totalChapters,
    })
    .from(book)
    .where(eq(book.id, bookId))
    .limit(1);
  return row ?? null;
}

export async function insertMeeting(values: typeof meeting.$inferInsert) {
  const [row] = await db.insert(meeting).values(values).returning();
  return row ?? null;
}

export async function findClubBookByClubAndBook(
  clubId: string,
  bookId: string
) {
  const [row] = await db
    .select()
    .from(clubBook)
    .where(
      and(eq(clubBook.bookId, bookId), eq(clubBook.clubId, clubId))
    )
    .limit(1);
  return row ?? null;
}

export async function updateClubBookStatusById(id: string, status: BookStatus) {
  await db.update(clubBook).set({ status }).where(eq(clubBook.id, id));
}

export async function updateMeetingById(
  id: string,
  data: {
    location: string;
    description: string | null;
    meetingDate: string;
    meetingTime: string;
    bookId: string | null;
    chapterStart: number | null;
    chapterEnd: number | null;
    clubId: string;
    status: MeetingStatus;
  }
) {
  const [row] = await db
    .update(meeting)
    .set({
      location: data.location,
      description: data.description,
      meetingDate: data.meetingDate,
      meetingTime: data.meetingTime,
      bookId: data.bookId,
      chapterStart: data.chapterStart,
      chapterEnd: data.chapterEnd,
      clubId: data.clubId,
      status: data.status,
    })
    .where(eq(meeting.id, id))
    .returning();
  return row ?? null;
}

export async function setMeetingCancelled(id: string) {
  const [row] = await db
    .update(meeting)
    .set({ status: MeetingStatus.CANCELLED })
    .where(eq(meeting.id, id))
    .returning();
  return row ?? null;
}
