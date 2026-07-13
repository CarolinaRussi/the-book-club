import { and, desc, eq, inArray, isNull, notExists, sql } from "drizzle-orm";
import { db } from "../db/client";
import { book, club, meeting, meetingRecap } from "../db/schema";
import { MeetingStatus } from "../enums/meetingStatus";

export async function findActiveRecapByMeetingId(meetingId: string) {
  const [row] = await db
    .select()
    .from(meetingRecap)
    .where(
      and(eq(meetingRecap.meetingId, meetingId), isNull(meetingRecap.deletedAt)),
    )
    .limit(1);
  return row ?? null;
}

export async function findActiveRecapsByMeetingIds(meetingIds: string[]) {
  if (meetingIds.length === 0) return [];

  return db
    .select({
      id: meetingRecap.id,
      meetingId: meetingRecap.meetingId,
      text: meetingRecap.text,
      imageUrl: meetingRecap.imageUrl,
      createdAt: meetingRecap.createdAt,
      updatedAt: meetingRecap.updatedAt,
    })
    .from(meetingRecap)
    .where(
      and(
        inArray(meetingRecap.meetingId, meetingIds),
        isNull(meetingRecap.deletedAt),
      ),
    );
}

export async function insertMeetingRecap(
  values: typeof meetingRecap.$inferInsert,
) {
  const [row] = await db.insert(meetingRecap).values(values).returning();
  return row ?? null;
}

export async function updateActiveMeetingRecap(
  meetingId: string,
  data: {
    text: string | null;
    imageUrl: string | null;
    imagePublicId: string | null;
  },
) {
  const [row] = await db
    .update(meetingRecap)
    .set({
      text: data.text,
      imageUrl: data.imageUrl,
      imagePublicId: data.imagePublicId,
      updatedAt: new Date(),
    })
    .where(
      and(eq(meetingRecap.meetingId, meetingId), isNull(meetingRecap.deletedAt)),
    )
    .returning();
  return row ?? null;
}

export async function softDeleteActiveMeetingRecap(meetingId: string) {
  const [row] = await db
    .update(meetingRecap)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(
      and(eq(meetingRecap.meetingId, meetingId), isNull(meetingRecap.deletedAt)),
    )
    .returning();
  return row ?? null;
}

export async function dismissMeetingRecapPrompt(meetingId: string) {
  const [row] = await db
    .update(meeting)
    .set({ recapPromptDismissedAt: new Date() })
    .where(eq(meeting.id, meetingId))
    .returning({
      id: meeting.id,
      recapPromptDismissedAt: meeting.recapPromptDismissedAt,
    });
  return row ?? null;
}

export async function findPendingMeetingRecapForOwner(ownerUserId: string) {
  const activeRecapExists = db
    .select({ one: sql`1` })
    .from(meetingRecap)
    .where(
      and(
        eq(meetingRecap.meetingId, meeting.id),
        isNull(meetingRecap.deletedAt),
      ),
    );

  const [row] = await db
    .select({
      id: meeting.id,
      meetingDate: meeting.meetingDate,
      meetingTime: meeting.meetingTime,
      location: meeting.location,
      description: meeting.description,
      clubId: club.id,
      clubName: club.name,
      bookId: book.id,
      bookTitle: book.title,
      bookAuthor: book.author,
      bookCoverUrl: book.coverUrl,
    })
    .from(meeting)
    .innerJoin(club, eq(meeting.clubId, club.id))
    .leftJoin(book, eq(meeting.bookId, book.id))
    .where(
      and(
        eq(club.ownerId, ownerUserId),
        eq(meeting.status, MeetingStatus.COMPLETED),
        isNull(meeting.recapPromptDismissedAt),
        notExists(activeRecapExists),
      ),
    )
    .orderBy(desc(meeting.meetingDate), desc(meeting.meetingTime))
    .limit(1);

  return row ?? null;
}
