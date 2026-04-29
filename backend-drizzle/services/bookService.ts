import { v2 as cloudinary } from "cloudinary";
import { BookCreateInput } from "../types/IBook";
import { uploadToCloudinary } from "../utils/cloudinary";
import * as bookRepository from "../repositories/bookRepository";

export { BookAlreadyInClubSuggestedError } from "../repositories/bookRepository";

export async function createBookForClub(input: {
  clubId: string;
  file?: Express.Multer.File;
  openLibraryId: string | undefined;
  coverUrlOpenLibrary: string | undefined;
  title: string;
  author: string | undefined;
}) {
  const bookPayload: Partial<BookCreateInput> = {
    title: input.title,
    author: input.author,
    openLibraryId: input.openLibraryId ?? "",
    coverUrl: input.coverUrlOpenLibrary ?? "",
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
    openLibraryId: input.openLibraryId,
    bookValues: {
      title: bookPayload.title!,
      author: bookPayload.author,
      openLibraryId: bookPayload.openLibraryId ?? "",
      coverUrl: bookPayload.coverUrl,
      coverPublicId: bookPayload.coverPublicId,
    },
  });
}

export async function getBooksByClubId(
  clubId: string,
  userId: string | undefined,
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

  const [booksList, allReviews, userBooksForBooks] = await Promise.all([
    bookRepository.findBooksByIds(bookIds),
    bookRepository.findReviewsWithUsersForClub(clubId, bookIds),
    bookRepository.findUserBooksByBookIds(bookIds),
  ]);

  const booksMap = new Map(booksList.map((b) => [b.id, b]));
  const userBooksMap = new Map(
    userBooksForBooks.map((ub) => [`${ub.userId}-${ub.bookId}`, ub])
  );

  const formattedData = clubBooksPaginated
    .map((cb) => {
      const b = booksMap.get(cb.bookId);
      if (!b) return null;
      const bookReviews = allReviews.filter((r) => r.bookId === b.id);
      const formattedReviews = bookReviews.map((r) => {
        const ub = userBooksMap.get(`${r.userId}-${b.id}`);
        return {
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          readingStatus: ub?.readingStatus ?? "not_started",
          user: {
            id: r.userIdFull,
            name: r.userName,
            nickname: r.userNickname,
            profilePicture: r.userProfilePicture,
          },
        };
      });
      const isInLibrary = userId
        ? userBooksForBooks.some(
            (ub) => ub.userId === userId && ub.bookId === b.id
          )
        : false;
      return {
        ...b,
        status: cb.status,
        addedAt: cb.addedAt,
        reviews: formattedReviews,
        isInLibrary,
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
  return books.map((b) => ({
    id: b.id,
    title: b.title,
    author: b.author,
    coverUrl: b.coverUrl,
  }));
}

export class NotClubMemberForReviewError extends Error {
  constructor() {
    super(
      "Não foi possível encontrar sua matrícula neste clube para avaliar este livro."
    );
    this.name = "NotClubMemberForReviewError";
  }
}

export async function saveReview(input: {
  userId: string;
  clubId: string;
  bookId: string;
  readingStatus: string;
  rating: number | null | undefined;
  comment: string | null | undefined;
}) {
  const memberRow = await bookRepository.findMemberByUserAndClub(
    input.userId,
    input.clubId
  );
  if (!memberRow) {
    throw new NotClubMemberForReviewError();
  }

  return bookRepository.transactionSaveReview({
    userId: input.userId,
    bookId: input.bookId,
    readingStatus: input.readingStatus,
    rating: input.rating,
    comment: input.comment,
  });
}
