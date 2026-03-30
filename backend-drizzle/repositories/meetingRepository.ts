import { eq, and, inArray, count } from "drizzle-orm";
import { db } from "../db/client";
import { meeting, clubBook } from "../db/schema";
import { MeetingStatus } from "../enums/meetingStatus";
import { BookStatus } from "../enums/bookStatus";

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
    bookId: string;
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
