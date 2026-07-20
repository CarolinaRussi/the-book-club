import { MeetingStatus } from "../enums/meetingStatus";
import { BookStatus } from "../enums/bookStatus";
import { ReadingMode } from "../enums/readingMode";
import { createId } from "../utils/id";
import { toMeetingDateYmd } from "../utils/meetingDate";
import * as meetingRepository from "../repositories/meetingRepository";
import * as meetingRecapRepository from "../repositories/meetingRecapRepository";
import * as bookRepository from "../repositories/bookRepository";
import * as clubRepository from "../repositories/clubRepository";
import * as googleCalendarSyncService from "./googleCalendarSyncService";

const MAX_MEETING_BOOKS = 4;

export class InvalidMeetingChapterRangeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidMeetingChapterRangeError";
  }
}

export class InvalidMeetingBooksError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidMeetingBooksError";
  }
}

type MeetingBookLink = {
  book: {
    id: string;
    title: string;
    author: string | null;
    coverUrl: string | null;
  } | null;
};

function formatMeetingBooks(meetingBooks: MeetingBookLink[]) {
  return meetingBooks
    .map((meetingBookRow) => meetingBookRow.book)
    .filter(
      (
        bookRow
      ): bookRow is {
        id: string;
        title: string;
        author: string | null;
        coverUrl: string | null;
      } => bookRow != null
    );
}

function normalizeBookIds(bookIds?: string[] | null): string[] {
  if (!bookIds || !Array.isArray(bookIds)) return [];
  const uniqueBookIds: string[] = [];
  for (const bookId of bookIds) {
    if (typeof bookId !== "string" || bookId.length === 0) continue;
    if (!uniqueBookIds.includes(bookId)) {
      uniqueBookIds.push(bookId);
    }
  }
  return uniqueBookIds;
}

async function validateAndResolveBookIds(input: {
  clubId: string;
  bookIds?: string[] | null;
}) {
  const bookIds = normalizeBookIds(input.bookIds);

  if (bookIds.length > MAX_MEETING_BOOKS) {
    throw new InvalidMeetingBooksError(
      `Um encontro pode ter no máximo ${MAX_MEETING_BOOKS} livros.`
    );
  }

  if (bookIds.length === 0) {
    return bookIds;
  }

  const readingMode = await meetingRepository.findClubReadingModeById(
    input.clubId
  );
  if (readingMode === ReadingMode.CHAPTERS && bookIds.length > 1) {
    throw new InvalidMeetingBooksError(
      "Clubes com leitura por capítulos só podem vincular um livro por encontro."
    );
  }

  const clubBookLinks =
    await meetingRepository.findActiveClubBooksByClubAndBookIds(
      input.clubId,
      bookIds
    );

  if (clubBookLinks.length !== bookIds.length) {
    throw new InvalidMeetingBooksError(
      "Um ou mais livros não pertencem a este clube."
    );
  }

  return bookIds;
}

async function markClubBooksStarted(clubId: string, bookIds: string[]) {
  if (bookIds.length === 0) return;

  const clubBookLinks =
    await meetingRepository.findActiveClubBooksByClubAndBookIds(
      clubId,
      bookIds
    );

  for (const clubBookLink of clubBookLinks) {
    if (clubBookLink.status !== BookStatus.STARTED) {
      await meetingRepository.updateClubBookStatusById(
        clubBookLink.id,
        BookStatus.STARTED
      );
    }
  }
}

export async function getMeetingsFromClub(clubId: string) {
  const meetingsList = await meetingRepository.findMeetingsWithBookByClubId(
    clubId
  );
  return meetingsList.map((meetingRow) => ({
    id: meetingRow.id,
    status: meetingRow.status,
    location: meetingRow.location,
    description: meetingRow.description,
    meetingDate: meetingRow.meetingDate,
    meetingTime: meetingRow.meetingTime,
    chapterStart: meetingRow.chapterStart,
    chapterEnd: meetingRow.chapterEnd,
    googleEventId: meetingRow.googleEventId,
    googleSyncError: meetingRow.googleSyncError,
    books: formatMeetingBooks(meetingRow.meetingBooks),
  }));
}

export async function getPastMeetingsFromClub(
  clubId: string,
  page: number,
  limit: number
) {
  const skip = (page - 1) * limit;
  const [meetingsList, totalItems] = await Promise.all([
    meetingRepository.findPastMeetingsWithBookPaginated(clubId, skip, limit),
    meetingRepository.countPastMeetingsByClubId(clubId),
  ]);

  const meetingIds = meetingsList.map((meetingRow) => meetingRow.id);
  const activeRecaps =
    await meetingRecapRepository.findActiveRecapsByMeetingIds(meetingIds);
  const recapByMeetingId = new Map(
    activeRecaps.map((recapRow) => [recapRow.meetingId, recapRow])
  );

  const totalPages = Math.ceil(totalItems / limit);
  const data = meetingsList.map((meetingRow) => {
    const recapRow = recapByMeetingId.get(meetingRow.id);
    return {
      id: meetingRow.id,
      status: meetingRow.status,
      location: meetingRow.location,
      description: meetingRow.description,
      meetingDate: meetingRow.meetingDate,
      meetingTime: meetingRow.meetingTime,
      createdAt: meetingRow.createdAt,
      chapterStart: meetingRow.chapterStart,
      chapterEnd: meetingRow.chapterEnd,
      books: formatMeetingBooks(meetingRow.meetingBooks),
      recap: recapRow
        ? {
            id: recapRow.id,
            text: recapRow.text,
            imageUrl: recapRow.imageUrl,
            createdAt: recapRow.createdAt,
            updatedAt: recapRow.updatedAt,
          }
        : null,
    };
  });

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
    books: row.books,
  }));

  return { data };
}

export async function createMeeting(input: {
  createdByUserId: string;
  bookIds?: string[] | null;
  chapterStart?: number | null;
  chapterEnd?: number | null;
  totalChapters?: number | null;
  description?: string | null;
  location: string;
  meetingDate: string;
  meetingTime: string;
  clubId: string;
}) {
  const bookIds = await validateAndResolveBookIds({
    clubId: input.clubId,
    bookIds: input.bookIds,
  });
  const chapterStart = input.chapterStart ?? null;
  const chapterEnd = input.chapterEnd ?? null;

  await validateMeetingChapterInput({
    clubId: input.clubId,
    bookIds,
    chapterStart,
    chapterEnd,
    totalChapters: input.totalChapters,
  });

  const newMeeting = await meetingRepository.insertMeeting({
    id: createId(),
    createdByUserId: input.createdByUserId,
    location: input.location,
    description: input.description ?? null,
    meetingDate: toMeetingDateYmd(input.meetingDate),
    meetingTime: input.meetingTime,
    chapterStart,
    chapterEnd,
    clubId: input.clubId,
    status: MeetingStatus.SCHEDULED,
  });

  if (!newMeeting) {
    throw new Error("insert_meeting_failed");
  }

  await meetingRepository.replaceMeetingBooks(newMeeting.id, bookIds);

  await googleCalendarSyncService
    .createGoogleCalendarEventForMeeting(newMeeting.id)
    .catch((error) => console.error(error));

  await markClubBooksStarted(input.clubId, bookIds);

  return newMeeting;
}

export async function updateMeeting(
  meetingId: string,
  input: {
    bookIds?: string[] | null;
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
  const bookIds = await validateAndResolveBookIds({
    clubId: input.clubId,
    bookIds: input.bookIds,
  });
  const chapterStart = input.chapterStart ?? null;
  const chapterEnd = input.chapterEnd ?? null;

  await validateMeetingChapterInput({
    clubId: input.clubId,
    bookIds,
    chapterStart,
    chapterEnd,
    totalChapters: input.totalChapters,
  });

  const updatedMeeting = await meetingRepository.updateMeetingById(meetingId, {
    location: input.location,
    description: input.description ?? null,
    meetingDate: toMeetingDateYmd(input.meetingDate),
    meetingTime: input.meetingTime,
    chapterStart,
    chapterEnd,
    clubId: input.clubId,
    status: input.status,
  });

  if (!updatedMeeting) {
    return null;
  }

  await meetingRepository.replaceMeetingBooks(meetingId, bookIds);

  if (input.status === MeetingStatus.CANCELLED) {
    await googleCalendarSyncService
      .deleteGoogleCalendarEventForMeeting(meetingId)
      .catch((error) => console.error(error));
  } else if (
    input.status === MeetingStatus.SCHEDULED &&
    updatedMeeting.googleEventId
  ) {
    await googleCalendarSyncService
      .updateGoogleCalendarEventForMeeting(meetingId)
      .catch((error) => console.error(error));
  }

  if (input.status === MeetingStatus.SCHEDULED) {
    await markClubBooksStarted(input.clubId, bookIds);
  }

  if (input.status === MeetingStatus.COMPLETED && bookIds.length > 0) {
    const readingMode = await meetingRepository.findClubReadingModeById(
      input.clubId
    );
    if (!readingMode) {
      return updatedMeeting;
    }

    if (readingMode === ReadingMode.BOOK) {
      const clubBookLinks =
        await meetingRepository.findActiveClubBooksByClubAndBookIds(
          input.clubId,
          bookIds
        );
      for (const clubBookLink of clubBookLinks) {
        await meetingRepository.updateClubBookStatusById(
          clubBookLink.id,
          BookStatus.FINISHED
        );
      }
      return updatedMeeting;
    }

    const soleBookId = bookIds[0]!;
    const bookRow = await meetingRepository.findBookById(soleBookId);
    const reachedLastChapter =
      chapterEnd !== null &&
      bookRow?.totalChapters != null &&
      chapterEnd === bookRow.totalChapters;

    if (reachedLastChapter) {
      const clubBookEntry = await meetingRepository.findClubBookByClubAndBook(
        input.clubId,
        soleBookId
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
  const cancelledMeeting = await meetingRepository.setMeetingCancelled(meetingId);
  if (cancelledMeeting) {
    await googleCalendarSyncService
      .deleteGoogleCalendarEventForMeeting(meetingId)
      .catch((error) => console.error(error));
  }
  return cancelledMeeting;
}

export async function autoCompleteOverdueMeetings(limit = 100) {
  const todayYmd = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const overdueMeetings =
    await meetingRepository.findScheduledMeetingsBeforeDate(todayYmd, limit);

  let completed = 0;
  let failed = 0;

  for (const meetingRow of overdueMeetings) {
    try {
      const meetingDate = toMeetingDateYmd(meetingRow.meetingDate);
      const bookIds = await meetingRepository.findBookIdsByMeetingId(
        meetingRow.id
      );

      await updateMeeting(meetingRow.id, {
        clubId: meetingRow.clubId,
        location: meetingRow.location,
        description: meetingRow.description,
        meetingDate,
        meetingTime: String(meetingRow.meetingTime).slice(0, 8),
        bookIds,
        chapterStart: meetingRow.chapterStart,
        chapterEnd: meetingRow.chapterEnd,
        status: MeetingStatus.COMPLETED,
      });
      completed += 1;
    } catch (error) {
      failed += 1;
      console.error(
        `[meetings:auto-complete] falha meetingId=${meetingRow.id}`,
        error
      );
    }
  }

  return { completed, failed, todayYmd };
}

export async function resyncMeetingGoogleCalendar(meetingId: string) {
  const meeting = await meetingRepository.findMeetingForGoogleCalendar(meetingId);
  if (!meeting) {
    return { success: false as const, message: "Encontro não encontrado." };
  }
  if (meeting.status === MeetingStatus.CANCELLED) {
    return {
      success: false as const,
      message: "Encontro cancelado; não é possível sincronizar.",
    };
  }
  if (meeting.googleEventId) {
    const syncResult =
      await googleCalendarSyncService.updateGoogleCalendarEventForMeeting(
        meetingId
      );
    if (!syncResult.ok) {
      return { success: false as const, message: syncResult.error };
    }
    return {
      success: true as const,
      message: "Evento atualizado no Google Calendar.",
    };
  }
  const syncResult =
    await googleCalendarSyncService.createGoogleCalendarEventForMeeting(
      meetingId
    );
  if (!syncResult.ok) {
    return { success: false as const, message: syncResult.error };
  }
  if (syncResult.skipped) {
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
  bookIds: string[];
  chapterStart: number | null;
  chapterEnd: number | null;
  totalChapters?: number | null;
}) {
  if (input.chapterStart === null && input.chapterEnd === null) {
    return;
  }

  if (input.bookIds.length !== 1) {
    throw new InvalidMeetingChapterRangeError(
      "Intervalo de capítulos só é permitido com exatamente um livro no encontro."
    );
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

  const bookId = input.bookIds[0]!;

  const readingMode = await meetingRepository.findClubReadingModeById(input.clubId);
  if (readingMode !== ReadingMode.CHAPTERS) {
    throw new InvalidMeetingChapterRangeError(
      "Intervalo de capítulos só é permitido em clubes com leitura por capítulos."
    );
  }

  const bookRow = await meetingRepository.findBookById(bookId);
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

    await bookRepository.updateBookTotalChaptersById(bookId, input.totalChapters);
    effectiveTotalChapters = input.totalChapters;
  }

  if (input.chapterEnd > effectiveTotalChapters) {
    throw new InvalidMeetingChapterRangeError(
      `O capítulo final não pode ultrapassar o total de capítulos do livro (${effectiveTotalChapters}).`
    );
  }
}
