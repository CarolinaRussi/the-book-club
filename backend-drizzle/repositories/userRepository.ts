import { eq, ne, count, and, inArray, sql } from "drizzle-orm";
import { db } from "../db/client";
import { user, userBook, review, clubBook, club, member } from "../db/schema";
import { ReadingStatus } from "../enums/readingStatus";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function findUserByEmail(email: string) {
  const normalized = normalizeEmail(email);
  const [row] = await db
    .select()
    .from(user)
    .where(sql`lower(${user.email}) = ${normalized}`)
    .limit(1);
  return row ?? null;
}

export async function findUserById(id: string) {
  const [row] = await db.select().from(user).where(eq(user.id, id)).limit(1);
  return row ?? null;
}

export async function findUsersByIds(userIds: string[]) {
  if (userIds.length === 0) return [];
  const unique = [...new Set(userIds)];
  return db
    .select({
      id: user.id,
      name: user.name,
      nickname: user.nickname,
    })
    .from(user)
    .where(inArray(user.id, unique));
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

export async function setUserPasswordReset(
  userId: string,
  tokenHash: string,
  expiresAt: Date,
) {
  return updateUserById(userId, {
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: expiresAt,
  });
}

export async function findUserByPasswordResetTokenHash(tokenHash: string) {
  const [row] = await db
    .select()
    .from(user)
    .where(eq(user.passwordResetTokenHash, tokenHash))
    .limit(1);
  return row ?? null;
}

export async function updateUserPassword(userId: string, hashedPassword: string) {
  return updateUserById(userId, {
    password: hashedPassword,
    passwordResetTokenHash: null,
    passwordResetExpiresAt: null,
  });
}

export async function updateUserGoogleOAuth(
  userId: string,
  values: {
    googleRefreshToken: string;
    googleAccessTokenExpiresAt: Date;
    googleCalendarId: string;
    googleAccountEmail: string | null;
  },
) {
  const [row] = await db
    .update(user)
    .set(values)
    .where(eq(user.id, userId))
    .returning();
  return row ?? null;
}

export async function clearUserGoogleOAuth(userId: string) {
  const [row] = await db
    .update(user)
    .set({
      googleRefreshToken: null,
      googleAccessTokenExpiresAt: null,
      googleCalendarId: null,
      googleAccountEmail: null,
    })
    .where(eq(user.id, userId))
    .returning();
  return row ?? null;
}

export async function findUserBookByUserAndBook(
  userId: string,
  bookId: string,
) {
  return db.query.userBook.findFirst({
    where: (userBookRow, { and, eq }) =>
      and(eq(userBookRow.userId, userId), eq(userBookRow.bookId, bookId)),
  });
}

export async function deleteUserBookById(id: string) {
  await db.delete(userBook).where(eq(userBook.id, id));
}

export async function insertUserBook(values: typeof userBook.$inferInsert) {
  const [row] = await db.insert(userBook).values(values).returning();
  return row ?? null;
}

export async function countUserBooksByUserId(
  userId: string,
  readingStatus?: ReadingStatus,
) {
  const statusFilter =
    readingStatus !== undefined
      ? eq(userBook.readingStatus, readingStatus)
      : ne(userBook.readingStatus, ReadingStatus.DROPPED);

  const [{ value: totalItems }] = await db
    .select({ value: count() })
    .from(userBook)
    .where(and(eq(userBook.userId, userId), statusFilter));
  return Number(totalItems ?? 0);
}

export async function findUserBooksPaginatedForUser(
  userId: string,
  offset: number,
  limit: number,
  readingStatus?: ReadingStatus,
) {
  const statusFilter =
    readingStatus !== undefined
      ? eq(userBook.readingStatus, readingStatus)
      : ne(userBook.readingStatus, ReadingStatus.DROPPED);

  return db.query.userBook.findMany({
    where: (userBookRow, { eq, and }) =>
      and(eq(userBookRow.userId, userId), statusFilter),
    orderBy: (userBookRow, { desc }) => [desc(userBookRow.updatedAt)],
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
