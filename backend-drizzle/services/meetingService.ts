import { MeetingStatus } from "../enums/meetingStatus";
import { BookStatus } from "../enums/bookStatus";
import { ReadingMode } from "../enums/readingMode";
import { createId } from "../utils/id";
import * as meetingRepository from "../repositories/meetingRepository";
import * as bookRepository from "../repositories/bookRepository";
import * as clubRepository from "../repositories/clubRepository";
import * as googleCalendarSyncService from "./googleCalendarSyncService";

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

export async function getMyUpcomingMeetings(userId: string, limit: number) {
  const clubIds = await clubRepository.findClubIdsByUserId(userId);
  const rows = await meetingRepository.findUpcomingMeetingsByClubIds(
    clubIds,
    limit
  );

  const data = rows.map((row) => ({
    id: row.id,
    meetingDate: row.meetingDate,
    meetingTime: row.meetingTime,
    location: row.location,
    description: row.description,
    chapterStart: row.chapterStart,
    chapterEnd: row.chapterEnd,
    club: {
      id: row.clubId,
      name: row.clubName,
    },
    book: row.bookId
      ? {
          id: row.bookId,
          title: row.bookTitle!,
          author: row.bookAuthor,
          coverUrl: row.bookCoverUrl,
        }
      : null,
  }));

  return { data };
}

export async function createMeeting(input: {
  createdByUserId: string;
  bookId?: string | null;
  chapterStart?: number | null;
  chapterEnd?: number | null;
  totalChapters?: number | null;
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
    totalChapters: input.totalChapters,
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

  void googleCalendarSyncService
    .createGoogleCalendarEventForMeeting(newMeeting.id)
    .catch((err) => console.error(err));

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
    totalChapters?: number | null;
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
    totalChapters: input.totalChapters,
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

  if (input.status === MeetingStatus.CANCELLED) {
    void googleCalendarSyncService
      .deleteGoogleCalendarEventForMeeting(meetingId)
      .catch((err) => console.error(err));
  } else if (
    input.status === MeetingStatus.SCHEDULED &&
    updatedMeeting.googleEventId
  ) {
    void googleCalendarSyncService
      .updateGoogleCalendarEventForMeeting(meetingId)
      .catch((err) => console.error(err));
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
  const row = await meetingRepository.setMeetingCancelled(meetingId);
  if (row) {
    void googleCalendarSyncService
      .deleteGoogleCalendarEventForMeeting(meetingId)
      .catch((err) => console.error(err));
  }
  return row;
}

export async function resyncMeetingGoogleCalendar(meetingId: string) {
  const m = await meetingRepository.findMeetingForGoogleCalendar(meetingId);
  if (!m) {
    return { success: false as const, message: "Encontro não encontrado." };
  }
  if (m.status === MeetingStatus.CANCELLED) {
    return {
      success: false as const,
      message: "Encontro cancelado; não é possível sincronizar.",
    };
  }
  if (m.googleEventId) {
    const r =
      await googleCalendarSyncService.updateGoogleCalendarEventForMeeting(
        meetingId,
      );
    if (!r.ok) {
      return { success: false as const, message: r.error };
    }
    return {
      success: true as const,
      message: "Evento atualizado no Google Calendar.",
    };
  }
  const r =
    await googleCalendarSyncService.createGoogleCalendarEventForMeeting(
      meetingId,
    );
  if (!r.ok) {
    return { success: false as const, message: r.error };
  }
  if (r.skipped) {
    return {
      success: true as const,
      message: "Já existia evento vinculado; nada a alterar.",
    };
  }
  return {
    success: true as const,
    message: "Evento criado no Google Calendar.",
  };
}

async function validateMeetingChapterInput(input: {
  clubId: string;
  bookId: string | null;
  chapterStart: number | null;
  chapterEnd: number | null;
  totalChapters?: number | null;
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

  let effectiveTotalChapters = bookRow.totalChapters;

  if (effectiveTotalChapters === null) {
    if (input.totalChapters === undefined || input.totalChapters === null) {
      throw new InvalidMeetingChapterRangeError(
        "Informe o total de capítulos do livro para marcar intervalo de capítulos."
      );
    }

    if (!Number.isInteger(input.totalChapters) || input.totalChapters < 1) {
      throw new InvalidMeetingChapterRangeError(
        "Total de capítulos deve ser um número inteiro positivo."
      );
    }

    if (input.totalChapters < input.chapterEnd) {
      throw new InvalidMeetingChapterRangeError(
        "O total de capítulos do livro não pode ser menor que o capítulo final do encontro."
      );
    }

    await bookRepository.updateBookTotalChaptersById(
      input.bookId,
      input.totalChapters
    );
    effectiveTotalChapters = input.totalChapters;
  }

  if (input.chapterEnd > effectiveTotalChapters) {
    throw new InvalidMeetingChapterRangeError(
      `O capítulo final não pode ultrapassar o total de capítulos do livro (${effectiveTotalChapters}).`
    );
  }
}
