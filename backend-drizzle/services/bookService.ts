import { v2 as cloudinary } from "cloudinary";
import { BookCreateInput } from "../types/IBook";
import { uploadToCloudinary } from "../utils/cloudinary";
import * as bookRepository from "../repositories/bookRepository";
import * as clubRepository from "../repositories/clubRepository";
import * as userRepository from "../repositories/userRepository";
import { BookStatus } from "../enums/bookStatus";
import { ReadingStatus } from "../enums/readingStatus";

export { BookAlreadyInClubSuggestedError } from "../repositories/bookRepository";

export async function createBookForClub(input: {
  clubId: string;
  suggestedByUserId: string;
  file?: Express.Multer.File;
  openLibraryId: string | undefined;
  coverUrlOpenLibrary: string | undefined;
  title: string;
  author: string | undefined;
  totalChapters?: number | null;
}) {
  const bookPayload: Partial<BookCreateInput> = {
    title: input.title,
    author: input.author,
    openLibraryId: input.openLibraryId ?? "",
    coverUrl: input.coverUrlOpenLibrary ?? "",
    totalChapters: input.totalChapters ?? null,
  };

  let uploadResult: { secure_url: string; public_id: string } | undefined;

  if (input.file) {
    uploadResult = await uploadToCloudinary(input.file.buffer);
  } else if (input.coverUrlOpenLibrary) {
    uploadResult = await cloudinary.uploader.upload(input.coverUrlOpenLibrary, {
      folder: "book_covers_project",
      public_id: input.openLibraryId
        ? `book_${input.openLibraryId}`
        : undefined,
    });
  }

  if (uploadResult) {
    bookPayload.coverUrl = uploadResult.secure_url;
    bookPayload.coverPublicId = uploadResult.public_id;
  }

  return bookRepository.transactionCreateBookForClub({
    clubId: input.clubId,
    suggestedByUserId: input.suggestedByUserId,
    openLibraryId: input.openLibraryId,
    bookValues: {
      title: bookPayload.title!,
      author: bookPayload.author,
      openLibraryId: bookPayload.openLibraryId ?? "",
      coverUrl: bookPayload.coverUrl,
      coverPublicId: bookPayload.coverPublicId,
        totalChapters: bookPayload.totalChapters ?? null,
    },
  });
}

export async function getBooksByClubId(
  clubId: string,
  page: number | undefined,
  limit: number | undefined
) {
  const clubBooksBase = await bookRepository.findClubBooksByClubOrdered(clubId);

  const clubBooksPaginated =
    page !== undefined && limit !== undefined
      ? clubBooksBase.slice((page - 1) * limit, page * limit)
      : clubBooksBase;

  const bookIds = clubBooksPaginated.map((cb) => cb.bookId);
  if (bookIds.length === 0) {
    if (page !== undefined && limit !== undefined) {
      const totalItems = clubBooksBase.length;
      return {
        kind: "paginated" as const,
        data: [],
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        totalItems,
      };
    }
    return { kind: "list" as const, data: [] };
  }

  const suggestedByUserIds = [
    ...new Set(
      clubBooksPaginated
        .map((cb) => cb.suggestedByUserId)
        .filter((id): id is string => Boolean(id))
    ),
  ];

  const [booksList, allReviews, userBooksForBooks, suggesterRows] =
    await Promise.all([
      bookRepository.findBooksByIds(bookIds),
      bookRepository.findReviewsWithUsersForClub(clubId, bookIds),
      bookRepository.findUserBooksByBookIds(bookIds),
      userRepository.findUsersByIds(suggestedByUserIds),
    ]);

  const booksMap = new Map(booksList.map((book) => [book.id, book]));
  const userBooksMap = new Map(
    userBooksForBooks.map((userBook) => [
      `${userBook.userId}-${userBook.bookId}`,
      userBook,
    ])
  );
  const suggesterById = new Map(
    suggesterRows.map((user) => [
      user.id,
      { id: user.id, name: user.name, nickname: user.nickname },
    ])
  );

  const formattedData = clubBooksPaginated
    .map((clubBook) => {
      const book = booksMap.get(clubBook.bookId);
      if (!book) return null;
      const bookReviews = allReviews.filter(
        (review) => review.bookId === book.id
      );
      const formattedReviews = bookReviews.map((review) => {
        const userBook = userBooksMap.get(`${review.userId}-${book.id}`);
        return {
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          readingStatus: userBook?.readingStatus ?? "not_started",
          user: {
            id: review.userIdFull,
            name: review.userName,
            nickname: review.userNickname,
            profilePicture: review.userProfilePicture,
          },
        };
      });
      const suggestedBy = clubBook.suggestedByUserId
        ? suggesterById.get(clubBook.suggestedByUserId) ?? null
        : null;
      return {
        ...book,
        status: clubBook.status,
        addedAt: clubBook.addedAt,
        reviews: formattedReviews,
        suggestedBy,
      };
    })
    .filter(Boolean);

  if (page !== undefined && limit !== undefined) {
    const totalItems = clubBooksBase.length;
    return {
      kind: "paginated" as const,
      data: formattedData,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
      totalItems,
    };
  }

  return { kind: "list" as const, data: formattedData };
}

export async function getBooksByTitleOrAuthor(query: string | undefined) {
  if (!query || typeof query !== "string") {
    return [];
  }
  const searchPattern = `%${query}%`;
  const books = await bookRepository.searchBooksByTitleOrAuthor(searchPattern);
  return books.map((book) => ({
    id: book.id,
    title: book.title,
    author: book.author,
    coverUrl: book.coverUrl,
  }));
}

type BookReviewScope = "all" | "my_clubs";

function dedupeReviewRowsById<
  ReviewRow extends { id: string; createdAt: Date },
>(reviewRows: ReviewRow[]) {
  const byId = new Map<string, ReviewRow>();
  for (const reviewRow of reviewRows) {
    if (!byId.has(reviewRow.id)) {
      byId.set(reviewRow.id, reviewRow);
    }
  }
  return [...byId.values()].sort(
    (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
  );
}

function formatReviewRows(
  reviewRows: Awaited<
    ReturnType<typeof bookRepository.findReviewsWithUsersForBookAll>
  >,
  userBooksForBook: Awaited<
    ReturnType<typeof bookRepository.findUserBooksByBookIds>
  >,
) {
  const userBooksMap = new Map(
    userBooksForBook.map((userBookRow) => [userBookRow.userId, userBookRow]),
  );
  return reviewRows.map((reviewRow) => {
    const userBookRow = userBooksMap.get(reviewRow.userId);
    return {
      id: reviewRow.id,
      rating: reviewRow.rating,
      comment: reviewRow.comment,
      readingStatus: userBookRow?.readingStatus ?? ReadingStatus.NOTSTARTED,
      user: {
        id: reviewRow.userIdFull,
        name: reviewRow.userName,
        nickname: reviewRow.userNickname,
        profilePicture: reviewRow.userProfilePicture,
      },
    };
  });
}

export async function getBookPage(input: {
  bookId: string;
  viewerUserId: string;
  reviewsScope: BookReviewScope;
  reviewsPage: number;
  reviewsLimit: number;
}) {
  const bookRow = await bookRepository.findBookById(input.bookId);
  if (!bookRow) {
    throw new BookNotFoundError();
  }

  const skip = (input.reviewsPage - 1) * input.reviewsLimit;

  const [myUserBook, myReviewRows, myClubsWithBook, viewerClubIdsWithBook] =
    await Promise.all([
      userRepository.findUserBookByUserAndBook(
        input.viewerUserId,
        input.bookId,
      ),
      userRepository.findMyReviewsForUserBookIds(input.viewerUserId, [
        input.bookId,
      ]),
      bookRepository.findViewerClubsWithBook(
        input.viewerUserId,
        input.bookId,
      ),
      bookRepository.findViewerClubIdsWithBook(
        input.viewerUserId,
        input.bookId,
      ),
    ]);

  const myReview = myReviewRows[0] ?? null;

  let reviewRows: Awaited<
    ReturnType<typeof bookRepository.findReviewsWithUsersForBookAll>
  > = [];
  let totalReviews = 0;

  if (input.reviewsScope === "all") {
    [reviewRows, totalReviews] = await Promise.all([
      bookRepository.findReviewsWithUsersForBookAll(
        input.bookId,
        skip,
        input.reviewsLimit,
      ),
      bookRepository.countReviewsForBookAll(input.bookId),
    ]);
  } else {
    const scopedReviewRows = dedupeReviewRowsById(
      await bookRepository.findReviewsWithUsersForBookInViewerClubs(
        input.bookId,
        viewerClubIdsWithBook,
      ),
    );
    totalReviews = scopedReviewRows.length;
    reviewRows = scopedReviewRows.slice(skip, skip + input.reviewsLimit);
  }

  const userBooksForBook = await bookRepository.findUserBooksByBookIds([
    input.bookId,
  ]);

  const totalPages = Math.ceil(totalReviews / input.reviewsLimit) || 0;

  return {
    book: {
      id: bookRow.id,
      title: bookRow.title,
      author: bookRow.author,
      coverUrl: bookRow.coverUrl,
      totalChapters: bookRow.totalChapters,
      createdAt: bookRow.createdAt,
    },
    myUserBook: myUserBook
      ? { readingStatus: myUserBook.readingStatus }
      : null,
    myReview: myReview
      ? { rating: myReview.rating, comment: myReview.comment }
      : null,
    myClubsWithBook: myClubsWithBook.map((clubRow) => ({
      id: clubRow.clubId,
      name: clubRow.clubName,
      clubBookStatus: clubRow.clubBookStatus,
      addedAt: clubRow.addedAt,
    })),
    reviews: {
      data: formatReviewRows(reviewRows, userBooksForBook),
      totalPages,
      currentPage: input.reviewsPage,
      totalItems: totalReviews,
    },
  };
}

export class NotClubMemberForReviewError extends Error {
  constructor() {
    super(
      "Não foi possível encontrar sua matrícula neste clube para avaliar este livro."
    );
    this.name = "NotClubMemberForReviewError";
  }
}

export class BookNotFoundError extends Error {
  constructor() {
    super("Livro não encontrado.");
    this.name = "BookNotFoundError";
  }
}

export class UnsupportedReadingStatusError extends Error {
  constructor() {
    super("Status de leitura inválido.");
    this.name = "UnsupportedReadingStatusError";
  }
}

export class ClubBookNotFoundError extends Error {
  constructor() {
    super("Livro não encontrado neste clube.");
    this.name = "ClubBookNotFoundError";
  }
}

export class DeleteClubBookForbiddenError extends Error {
  constructor() {
    super("Você não tem permissão para excluir este livro.");
    this.name = "DeleteClubBookForbiddenError";
  }
}

export class InvalidBookTotalChaptersError extends Error {
  constructor() {
    super("Total de capítulos deve ser um número inteiro positivo.");
    this.name = "InvalidBookTotalChaptersError";
  }
}

export async function updateBookTotalChapters(input: {
  clubId: string;
  bookId: string;
  totalChapters: number;
}) {
  if (!Number.isInteger(input.totalChapters) || input.totalChapters < 1) {
    throw new InvalidBookTotalChaptersError();
  }

  const clubBook = await bookRepository.findActiveClubBookByClubAndBook(
    input.clubId,
    input.bookId
  );

  if (!clubBook) {
    throw new ClubBookNotFoundError();
  }

  return bookRepository.updateBookTotalChaptersById(
    input.bookId,
    input.totalChapters
  );
}

export async function saveReview(input: {
  userId: string;
  clubId?: string;
  bookId: string;
  readingStatus: string;
  rating: number | null | undefined;
  comment: string | null | undefined;
}) {
  if (input.readingStatus === ReadingStatus.WANT_TO_READ) {
    throw new UnsupportedReadingStatusError();
  }

  if (input.clubId) {
    const memberRow = await bookRepository.findMemberByUserAndClub(
      input.userId,
      input.clubId,
    );
    if (!memberRow) {
      throw new NotClubMemberForReviewError();
    }
  } else {
    const bookRow = await bookRepository.findBookById(input.bookId);
    if (!bookRow) {
      throw new BookNotFoundError();
    }
  }

  return bookRepository.transactionSaveReview({
    userId: input.userId,
    bookId: input.bookId,
    readingStatus: input.readingStatus,
    rating: input.rating,
    comment: input.comment,
  });
}

export async function deleteBookFromClub(input: {
  clubId: string;
  bookId: string;
  userId: string;
}) {
  const clubBook = await bookRepository.findActiveClubBookByClubAndBook(
    input.clubId,
    input.bookId
  );

  if (!clubBook) {
    throw new ClubBookNotFoundError();
  }

  const ownerId = await clubRepository.findClubOwnerId(input.clubId);
  const isOwner = ownerId === input.userId;
  const isSuggestedByUser = clubBook.suggestedByUserId === input.userId;

  if (clubBook.status === BookStatus.SUGGESTED) {
    if (!isOwner && !isSuggestedByUser) {
      throw new DeleteClubBookForbiddenError();
    }
  } else if (!isOwner) {
    throw new DeleteClubBookForbiddenError();
  }

  return bookRepository.softDeleteClubBookById(clubBook.id);
}
