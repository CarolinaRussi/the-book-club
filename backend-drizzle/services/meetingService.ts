import { MeetingStatus } from "../enums/meetingStatus";
import { BookStatus } from "../enums/bookStatus";
import { createId } from "../utils/id";
import * as meetingRepository from "../repositories/meetingRepository";

function formatMeetingBook(m: {
  book: {
    id: string;
    title: string;
    author: string | null;
    coverUrl: string | null;
  } | null;
}) {
  return m.book
    ? {
        id: m.book.id,
        title: m.book.title,
        author: m.book.author,
        coverUrl: m.book.coverUrl,
      }
    : null;
}

export async function getMeetingsFromClub(clubId: string) {
  const meetingsList = await meetingRepository.findMeetingsWithBookByClubId(
    clubId
  );
  return meetingsList.map((m) => ({
    id: m.id,
    status: m.status,
    location: m.location,
    description: m.description,
    meetingDate: m.meetingDate,
    meetingTime: m.meetingTime,
    book: formatMeetingBook(m),
  }));
}

export async function getPastMeetingsFromClub(
  clubId: string,
  page: number,
  limit: number
) {
  const skip = (page - 1) * limit;
  const [meetingsList, totalItems] = await Promise.all([
    meetingRepository.findPastMeetingsWithBookPaginated(
      clubId,
      skip,
      limit
    ),
    meetingRepository.countPastMeetingsByClubId(clubId),
  ]);

  const totalPages = Math.ceil(totalItems / limit);
  const data = meetingsList.map((m) => ({
    id: m.id,
    status: m.status,
    location: m.location,
    description: m.description,
    meetingDate: m.meetingDate,
    meetingTime: m.meetingTime,
    createdAt: m.createdAt,
    book: formatMeetingBook(m as any),
  }));

  return { data, totalPages, currentPage: page, totalItems };
}

export async function createMeeting(input: {
  bookId: string;
  description?: string | null;
  location: string;
  meetingDate: string;
  meetingTime: string;
  clubId: string;
}) {
  const newMeeting = await meetingRepository.insertMeeting({
    id: createId(),
    location: input.location,
    description: input.description ?? null,
    meetingDate: new Date(input.meetingDate).toISOString().slice(0, 10),
    meetingTime: input.meetingTime,
    bookId: input.bookId,
    clubId: input.clubId,
    status: MeetingStatus.SCHEDULED,
  });

  if (!newMeeting) {
    throw new Error("insert_meeting_failed");
  }

  const clubBookEntry = await meetingRepository.findClubBookByClubAndBook(
    input.clubId,
    input.bookId
  );

  if (clubBookEntry && clubBookEntry.status !== BookStatus.STARTED) {
    await meetingRepository.updateClubBookStatusById(
      clubBookEntry.id,
      BookStatus.STARTED
    );
  }

  return newMeeting;
}

export async function updateMeeting(
  meetingId: string,
  input: {
    bookId: string;
    description?: string | null;
    location: string;
    meetingDate: string;
    meetingTime: string;
    status: (typeof MeetingStatus)[keyof typeof MeetingStatus];
    clubId: string;
  }
) {
  const updatedMeeting = await meetingRepository.updateMeetingById(
    meetingId,
    {
      location: input.location,
      description: input.description ?? null,
      meetingDate: new Date(input.meetingDate).toISOString().slice(0, 10),
      meetingTime: input.meetingTime,
      bookId: input.bookId,
      clubId: input.clubId,
      status: input.status,
    }
  );

  if (!updatedMeeting) {
    return null;
  }

  if (input.status === MeetingStatus.COMPLETED) {
    const clubBookEntry = await meetingRepository.findClubBookByClubAndBook(
      input.clubId,
      input.bookId
    );
    if (clubBookEntry) {
      await meetingRepository.updateClubBookStatusById(
        clubBookEntry.id,
        BookStatus.FINISHED
      );
    }
  }

  return updatedMeeting;
}

export async function cancelMeeting(meetingId: string) {
  return meetingRepository.setMeetingCancelled(meetingId);
}
