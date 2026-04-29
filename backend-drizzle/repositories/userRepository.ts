import { eq, ne, count, and, inArray } from "drizzle-orm";
import { db } from "../db/client";
import { user, userBook, review, clubBook, club, member } from "../db/schema";
import { ReadingStatus } from "../enums/readingStatus";

export async function findUserByEmail(email: string) {
  const [row] = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);
  return row ?? null;
}

export async function findUserById(id: string) {
  const [row] = await db.select().from(user).where(eq(user.id, id)).limit(1);
  return row ?? null;
}

export async function insertUser(values: typeof user.$inferInsert) {
  const [row] = await db.insert(user).values(values).returning();
  return row ?? null;
}

export async function updateUserById(
  id: string,
  data: Record<string, unknown>,
) {
  const [row] = await db
    .update(user)
    .set(data as typeof user.$inferInsert)
    .where(eq(user.id, id))
    .returning();
  return row ?? null;
}

export async function findUserBookByUserAndBook(
  userId: string,
  bookId: string,
) {
  return db.query.userBook.findFirst({
    where: (ub, { and, eq }) =>
      and(eq(ub.userId, userId), eq(ub.bookId, bookId)),
  });
}

export async function deleteUserBookById(id: string) {
  await db.delete(userBook).where(eq(userBook.id, id));
}

export async function insertUserBook(values: typeof userBook.$inferInsert) {
  const [row] = await db.insert(userBook).values(values).returning();
  return row ?? null;
}

export async function countUserBooksByUserId(userId: string) {
  const [{ value: totalItems }] = await db
    .select({ value: count() })
    .from(userBook)
    .where(
      and(
        eq(userBook.userId, userId),
        ne(userBook.readingStatus, ReadingStatus.DROPPED),
      ),
    );
  return Number(totalItems ?? 0);
}

export async function findUserBooksPaginatedForUser(
  userId: string,
  offset: number,
  limit: number,
) {
  return db.query.userBook.findMany({
    where: (ub, { eq, and, ne }) =>
      and(eq(ub.userId, userId), ne(ub.readingStatus, ReadingStatus.DROPPED)),
    orderBy: (ub, { desc }) => [desc(ub.updatedAt)],
    offset,
    limit,
    with: {
      book: {
        columns: {
          id: true,
          title: true,
          author: true,
          coverUrl: true,
        },
      },
    },
    columns: { id: true, updatedAt: true, readingStatus: true },
  });
}

export async function findMyReviewsForUserBookIds(
  userId: string,
  bookIds: string[],
) {
  if (bookIds.length === 0) return [];
  return db
    .select({
      bookId: review.bookId,
      rating: review.rating,
      comment: review.comment,
    })
    .from(review)
    .where(and(eq(review.userId, userId), inArray(review.bookId, bookIds)));
}

export async function findClubsForUserBooksByBookIds(
  userId: string,
  bookIds: string[],
) {
  if (bookIds.length === 0) return [];
  return db
    .select({
      bookId: clubBook.bookId,
      clubId: club.id,
      clubName: club.name,
    })
    .from(clubBook)
    .innerJoin(club, eq(clubBook.clubId, club.id))
    .innerJoin(member, eq(member.clubId, club.id))
    .where(and(eq(member.userId, userId), inArray(clubBook.bookId, bookIds)));
}
