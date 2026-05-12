import { v2 as cloudinary } from "cloudinary";
import { uploadToCloudinary } from "../utils/cloudinary";
import { createId } from "../utils/id";
import { toPublicUser } from "../utils/publicUser";
import * as userRepository from "../repositories/userRepository";

const USER_UPDATE_BLOCKED_KEYS = new Set([
  "id",
  "password",
  "status",
  "createdAt",
  "email",
  "googleRefreshToken",
  "googleAccessTokenExpiresAt",
  "googleCalendarId",
  "googleAccountEmail",
]);

export async function getUserAuthenticated(userId: string) {
  const row = await userRepository.findUserById(userId);
  if (!row) {
    return null;
  }
  return toPublicUser(row);
}

export async function updateUserProfile(input: {
  id: string;
  file?: Express.Multer.File;
  removeProfilePicture?: string | boolean;
  otherData: Record<string, unknown>;
}) {
  const foundUser = await userRepository.findUserById(input.id);
  if (!foundUser) {
    return { ok: false as const, reason: "not_found" as const };
  }

  const updateData: Record<string, unknown> = { ...input.otherData };
  for (const key of USER_UPDATE_BLOCKED_KEYS) {
    delete updateData[key];
  }
  const oldPublicId = foundUser.profilePicturePublicId;
  const remove = input.removeProfilePicture;

  if (remove === "true" || remove === true) {
    if (oldPublicId) {
      await cloudinary.uploader.destroy(oldPublicId);
    }
    updateData.profilePicture = null;
    updateData.profilePicturePublicId = null;
  } else if (input.file) {
    const uploadResult = await uploadToCloudinary(input.file.buffer);
    updateData.profilePicture = uploadResult.secure_url;
    updateData.profilePicturePublicId = uploadResult.public_id;
    if (oldPublicId) {
      await cloudinary.uploader.destroy(oldPublicId);
    }
  }

  const updatedUser = await userRepository.updateUserById(input.id, updateData);
  if (!updatedUser) {
    return { ok: false as const, reason: "update_failed" as const };
  }

  return { ok: true as const, user: toPublicUser(updatedUser) };
}

export async function getUserReadingsPaginated(
  userId: string,
  page: number,
  limit: number
) {
  const skip = (page - 1) * limit;
  const [userBooksData, totalItems] = await Promise.all([
    userRepository.findUserBooksPaginatedForUser(userId, skip, limit),
    userRepository.countUserBooksByUserId(userId),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  const bookIds = userBooksData
    .map((ub) => ub.book?.id)
    .filter((id): id is string => Boolean(id));

  const [reviewRows, clubLinks] = await Promise.all([
    userRepository.findMyReviewsForUserBookIds(userId, bookIds),
    userRepository.findClubsForUserBooksByBookIds(userId, bookIds),
  ]);

  const clubsByBookId = new Map<string, { id: string; name: string }[]>();
  for (const row of clubLinks) {
    const list = clubsByBookId.get(row.bookId) ?? [];
    if (!list.some((c) => c.id === row.clubId)) {
      list.push({ id: row.clubId, name: row.clubName });
    }
    clubsByBookId.set(row.bookId, list);
  }
  for (const [, list] of clubsByBookId) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  const reviewByBookId = new Map<
    string,
    { rating: number | null; comment: string | null }
  >();
  for (const row of reviewRows) {
    if (!reviewByBookId.has(row.bookId)) {
      reviewByBookId.set(row.bookId, {
        rating: row.rating,
        comment: row.comment,
      });
    }
  }

  const data = userBooksData.map((ub) => {
    const book = ub.book;
    const mine = book ? reviewByBookId.get(book.id) : undefined;
    return {
      id: ub.id,
      updatedAt: ub.updatedAt,
      readingStatus: ub.readingStatus,
      myRating: mine?.rating ?? null,
      myComment: mine?.comment ?? null,
      clubs: book ? (clubsByBookId.get(book.id) ?? []) : [],
      book: book
        ? {
            id: book.id,
            title: book.title,
            author: book.author,
            coverUrl: book.coverUrl,
          }
        : null,
    };
  });

  return { data, totalPages, currentPage: page, totalItems };
}

export async function updatePersonalLibrary(userId: string, bookId: string) {
  const existing = await userRepository.findUserBookByUserAndBook(
    userId,
    bookId
  );

  if (existing) {
    await userRepository.deleteUserBookById(existing.id);
    return {
      action: "removed" as const,
      message: "Livro removido da biblioteca pessoal.",
    };
  }

  const newUserBook = await userRepository.insertUserBook({
    id: createId(),
    bookId,
    userId,
  });

  if (!newUserBook) {
    throw new Error("insert_user_book_failed");
  }

  return {
    action: "added" as const,
    message: "Livro adicionado à biblioteca pessoal com sucesso!",
    userBook: newUserBook,
  };
}
