import { MeetingStatus } from "../enums/meetingStatus";
import { BookStatus } from "../enums/bookStatus";
import { ReadingMode } from "../enums/readingMode";
import { createId } from "../utils/id";
import * as meetingRepository from "../repositories/meetingRepository";

export class InvalidMeetingChapterRangeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidMeetingChapterRangeError";
  }
}

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
    chapterStart: m.chapterStart,
    chapterEnd: m.chapterEnd,
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
    chapterStart: m.chapterStart,
    chapterEnd: m.chapterEnd,
    book: formatMeetingBook(m as any),
  }));

  return { data, totalPages, currentPage: page, totalItems };
}

export async function createMeeting(input: {
  createdByUserId: string;
  bookId?: string | null;
  chapterStart?: number | null;
  chapterEnd?: number | null;
  description?: string | null;
  location: string;
  meetingDate: string;
  meetingTime: string;
  clubId: string;
}) {
  const bookId = input.bookId ?? null;
  const chapterStart = input.chapterStart ?? null;
  const chapterEnd = input.chapterEnd ?? null;

  await validateMeetingChapterInput({
    clubId: input.clubId,
    bookId,
    chapterStart,
    chapterEnd,
  });

  const newMeeting = await meetingRepository.insertMeeting({
    id: createId(),
    createdByUserId: input.createdByUserId,
    location: input.location,
    description: input.description ?? null,
    meetingDate: new Date(input.meetingDate).toISOString().slice(0, 10),
    meetingTime: input.meetingTime,
    bookId,
    chapterStart,
    chapterEnd,
    clubId: input.clubId,
    status: MeetingStatus.SCHEDULED,
  });

  if (!newMeeting) {
    throw new Error("insert_meeting_failed");
  }

  if (!bookId) {
    return newMeeting;
  }

  const clubBookEntry = await meetingRepository.findClubBookByClubAndBook(
    input.clubId,
    bookId
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
    bookId?: string | null;
    chapterStart?: number | null;
    chapterEnd?: number | null;
    description?: string | null;
    location: string;
    meetingDate: string;
    meetingTime: string;
    status: (typeof MeetingStatus)[keyof typeof MeetingStatus];
    clubId: string;
  }
) {
  const bookId = input.bookId ?? null;
  const chapterStart = input.chapterStart ?? null;
  const chapterEnd = input.chapterEnd ?? null;

  await validateMeetingChapterInput({
    clubId: input.clubId,
    bookId,
    chapterStart,
    chapterEnd,
  });

  const updatedMeeting = await meetingRepository.updateMeetingById(
    meetingId,
    {
      location: input.location,
      description: input.description ?? null,
      meetingDate: new Date(input.meetingDate).toISOString().slice(0, 10),
      meetingTime: input.meetingTime,
      bookId,
      chapterStart,
      chapterEnd,
      clubId: input.clubId,
      status: input.status,
    }
  );

  if (!updatedMeeting) {
    return null;
  }

  if (input.status === MeetingStatus.COMPLETED && bookId) {
    const readingMode = await meetingRepository.findClubReadingModeById(input.clubId);
    if (!readingMode) {
      return updatedMeeting;
    }

    if (readingMode === ReadingMode.BOOK) {
      const clubBookEntry = await meetingRepository.findClubBookByClubAndBook(
        input.clubId,
        bookId
      );
      if (clubBookEntry) {
        await meetingRepository.updateClubBookStatusById(
          clubBookEntry.id,
          BookStatus.FINISHED
        );
      }
      return updatedMeeting;
    }

    const bookRow = await meetingRepository.findBookById(bookId);
    const reachedLastChapter =
      chapterEnd !== null &&
      bookRow?.totalChapters != null &&
      chapterEnd === bookRow.totalChapters;

    if (reachedLastChapter) {
      const clubBookEntry = await meetingRepository.findClubBookByClubAndBook(
        input.clubId,
        bookId
      );
      if (clubBookEntry) {
        await meetingRepository.updateClubBookStatusById(
          clubBookEntry.id,
          BookStatus.FINISHED
        );
      }
    }
  }

  return updatedMeeting;
}

export async function cancelMeeting(meetingId: string) {
  return meetingRepository.setMeetingCancelled(meetingId);
}

async function validateMeetingChapterInput(input: {
  clubId: string;
  bookId: string | null;
  chapterStart: number | null;
  chapterEnd: number | null;
}) {
  if (input.chapterStart === null && input.chapterEnd === null) {
    return;
  }

  if (input.chapterStart === null || input.chapterEnd === null) {
    throw new InvalidMeetingChapterRangeError(
      "Informe o capítulo inicial e final para a discussão."
    );
  }

  if (!Number.isInteger(input.chapterStart) || !Number.isInteger(input.chapterEnd)) {
    throw new InvalidMeetingChapterRangeError(
      "Os capítulos precisam ser números inteiros."
    );
  }

  if (input.chapterStart < 1 || input.chapterEnd < 1) {
    throw new InvalidMeetingChapterRangeError(
      "Os capítulos devem ser maiores ou iguais a 1."
    );
  }

  if (input.chapterEnd < input.chapterStart) {
    throw new InvalidMeetingChapterRangeError(
      "O capítulo final deve ser maior ou igual ao capítulo inicial."
    );
  }

  if (!input.bookId) {
    throw new InvalidMeetingChapterRangeError(
      "Selecione um livro para informar intervalo de capítulos."
    );
  }

  const readingMode = await meetingRepository.findClubReadingModeById(input.clubId);
  if (readingMode !== ReadingMode.CHAPTERS) {
    throw new InvalidMeetingChapterRangeError(
      "Intervalo de capítulos só é permitido em clubes com leitura por capítulos."
    );
  }

  const bookRow = await meetingRepository.findBookById(input.bookId);
  if (!bookRow) {
    throw new InvalidMeetingChapterRangeError("Livro não encontrado.");
  }

  if (
    bookRow.totalChapters !== null &&
    input.chapterEnd > bookRow.totalChapters
  ) {
    throw new InvalidMeetingChapterRangeError(
      `O capítulo final não pode ultrapassar o total de capítulos do livro (${bookRow.totalChapters}).`
    );
  }
}
