import { v2 as cloudinary } from "cloudinary";
import { uploadToCloudinary } from "../utils/cloudinary";
import { createId } from "../utils/id";
import * as userRepository from "../repositories/userRepository";

export async function getUserAuthenticated(userId: string) {
  return userRepository.findUserById(userId);
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

  const { password, ...userParaFront } = updatedUser;
  return { ok: true as const, user: userParaFront };
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
  const data = userBooksData.map((ub) => ({
    id: ub.id,
    updatedAt: ub.updatedAt,
    readingStatus: ub.readingStatus,
    book: ub.book
      ? {
          id: ub.book.id,
          title: ub.book.title,
          author: ub.book.author,
          coverUrl: ub.book.coverUrl,
          reviews: (ub.book as any).reviews ?? [],
        }
      : null,
  }));

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
