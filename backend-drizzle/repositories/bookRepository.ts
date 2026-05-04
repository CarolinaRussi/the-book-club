import { eq, and, or, inArray, desc, ilike } from "drizzle-orm";
import { db } from "../db/client";
import {
  book,
  clubBook,
  userBook,
  review,
  user,
  member,
} from "../db/schema";
import { BookStatus } from "../enums/bookStatus";
import { createId } from "../utils/id";

export async function findClubBooksByClubOrdered(clubId: string) {
  return db
    .select()
    .from(clubBook)
    .where(eq(clubBook.clubId, clubId))
    .orderBy(desc(clubBook.addedAt));
}

export async function findBooksByIds(bookIds: string[]) {
  if (bookIds.length === 0) return [];
  return db.select().from(book).where(inArray(book.id, bookIds));
}

export async function findReviewsWithUsersForClub(
  clubId: string,
  bookIds: string[]
) {
  if (bookIds.length === 0) return [];
  return db
    .select({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      userId: review.userId,
      bookId: review.bookId,
      userName: user.name,
      userNickname: user.nickname,
      userProfilePicture: user.profilePicture,
      userIdFull: user.id,
    })
    .from(review)
    .innerJoin(user, eq(review.userId, user.id))
    .innerJoin(member, eq(member.userId, user.id))
    .where(and(eq(member.clubId, clubId), inArray(review.bookId, bookIds)));
}

export async function findUserBooksByBookIds(bookIds: string[]) {
  if (bookIds.length === 0) return [];
  return db
    .select()
    .from(userBook)
    .where(inArray(userBook.bookId, bookIds));
}

export async function searchBooksByTitleOrAuthor(pattern: string) {
  return db
    .select({
      id: book.id,
      title: book.title,
      author: book.author,
      coverUrl: book.coverUrl,
    })
    .from(book)
    .where(
      or(ilike(book.title, pattern), ilike(book.author ?? "", pattern))
    )
    .limit(10);
}

export class BookAlreadyInClubSuggestedError extends Error {
  constructor() {
    super("Este livro já foi adicionado a este clube.");
    this.name = "BookAlreadyInClubSuggestedError";
  }
}

export async function transactionCreateBookForClub(input: {
  clubId: string;
  suggestedByUserId: string;
  openLibraryId: string | undefined;
  bookValues: {
    title: string;
    author: string | null | undefined;
    openLibraryId: string;
    coverUrl: string | null | undefined;
    coverPublicId: string | null | undefined;
  };
}) {
  return db.transaction(async (tx) => {
    let bookRecord: typeof book.$inferSelect | undefined;
    const olId = input.openLibraryId;

    if (olId) {
      const existing = await tx
        .select()
        .from(book)
        .where(or(eq(book.openLibraryId, olId), eq(book.id, olId)))
        .limit(1);
      bookRecord = existing[0];
    }

    if (!bookRecord) {
      const [created] = await tx
        .insert(book)
        .values({
          id: createId(),
          title: input.bookValues.title,
          author: input.bookValues.author,
          openLibraryId: input.bookValues.openLibraryId,
          coverUrl: input.bookValues.coverUrl,
          coverPublicId: input.bookValues.coverPublicId,
        })
        .returning();
      bookRecord = created!;
    }

    const existingLink = await tx
      .select()
      .from(clubBook)
      .where(
        and(
          eq(clubBook.clubId, input.clubId),
          eq(clubBook.bookId, bookRecord.id),
          eq(clubBook.status, BookStatus.SUGGESTED)
        )
      )
      .limit(1);

    if (existingLink.length > 0) {
      throw new BookAlreadyInClubSuggestedError();
    }

    const [clubBookLink] = await tx
      .insert(clubBook)
      .values({
        id: createId(),
        clubId: input.clubId,
        bookId: bookRecord.id,
        suggestedByUserId: input.suggestedByUserId,
        status: BookStatus.SUGGESTED,
      })
      .returning();

    return clubBookLink!;
  });
}

export async function findMemberByUserAndClub(userId: string, clubId: string) {
  const [row] = await db
    .select()
    .from(member)
    .where(and(eq(member.userId, userId), eq(member.clubId, clubId)))
    .limit(1);
  return row ?? null;
}

export async function transactionSaveReview(input: {
  userId: string;
  bookId: string;
  readingStatus: string;
  rating: number | null | undefined;
  comment: string | null | undefined;
}) {
  return db.transaction(async (tx) => {
    const existingUserBook = await tx
      .select()
      .from(userBook)
      .where(
        and(
          eq(userBook.userId, input.userId),
          eq(userBook.bookId, input.bookId)
        )
      )
      .limit(1);

    let savedUserBook: typeof userBook.$inferSelect;
    if (existingUserBook.length > 0) {
      const [updated] = await tx
        .update(userBook)
        .set({ readingStatus: input.readingStatus as any })
        .where(eq(userBook.id, existingUserBook[0].id))
        .returning();
      savedUserBook = updated!;
    } else {
      const [inserted] = await tx
        .insert(userBook)
        .values({
          id: createId(),
          userId: input.userId,
          bookId: input.bookId,
          readingStatus: input.readingStatus as any,
        })
        .returning();
      savedUserBook = inserted!;
    }

    const existingReview = await tx
      .select()
      .from(review)
      .where(
        and(
          eq(review.userId, input.userId),
          eq(review.bookId, input.bookId)
        )
      )
      .limit(1);

    const ratingValue =
      input.rating === null || input.rating === undefined
        ? null
        : Number(input.rating);

    let savedReview: typeof review.$inferSelect;
    if (existingReview.length > 0) {
      const [updated] = await tx
        .update(review)
        .set({
          rating: ratingValue,
          comment: input.comment ?? null,
        })
        .where(eq(review.id, existingReview[0].id))
        .returning();
      savedReview = updated!;
    } else {
      const [inserted] = await tx
        .insert(review)
        .values({
          id: createId(),
          userId: input.userId,
          bookId: input.bookId,
          rating: ratingValue,
          comment: input.comment ?? null,
        })
        .returning();
      savedReview = inserted!;
    }

    return { savedUserBook, savedReview };
  });
}
