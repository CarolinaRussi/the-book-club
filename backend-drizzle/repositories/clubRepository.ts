import { and, eq, count } from "drizzle-orm";
import { db } from "../db/client";
import { club, member, user } from "../db/schema";
import { ClubStatus } from "../enums/clubStatus";
import { ReadingMode } from "../enums/readingMode";

export async function findClubIdsByUserId(userId: string) {
  const memberships = await db
    .select()
    .from(member)
    .where(eq(member.userId, userId));
  return memberships.map((membership) => membership.clubId);
}

export async function findClubsByIds(clubIds: string[]) {
  if (clubIds.length === 0) return [];
  return db.query.club.findMany({
    where: (clubRow, { inArray }) => inArray(clubRow.id, clubIds),
    orderBy: (clubRow, { desc }) => [
      desc(clubRow.status),
      desc(clubRow.createdAt),
    ],
  });
}

export async function findClubByInvitationCode(code: string) {
  const [row] = await db
    .select({
      id: club.id,
      name: club.name,
      description: club.description,
      ownerId: club.ownerId,
    })
    .from(club)
    .where(
      and(
        eq(club.invitationCode, code),
        eq(club.status, ClubStatus.ACTIVE)
      )
    )
    .limit(1);
  return row ?? null;
}

export async function findActiveClubById(clubId: string) {
  const [row] = await db
    .select({
      id: club.id,
      name: club.name,
      status: club.status,
    })
    .from(club)
    .where(and(eq(club.id, clubId), eq(club.status, ClubStatus.ACTIVE)))
    .limit(1);
  return row ?? null;
}

export async function findClubOwnerId(clubId: string): Promise<string | null> {
  const [row] = await db
    .select({ ownerId: club.ownerId })
    .from(club)
    .where(eq(club.id, clubId))
    .limit(1);
  return row?.ownerId ?? null;
}

export async function findUserNameById(userId: string) {
  const [row] = await db
    .select({ name: user.name })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  return row?.name ?? null;
}

export async function insertClub(values: typeof club.$inferInsert) {
  const [row] = await db.insert(club).values(values).returning();
  return row ?? null;
}

export async function updateClubById(
  id: string,
  data: {
    name: string;
    description?: string;
    invitationCode: string;
    readingMode?: (typeof ReadingMode)[keyof typeof ReadingMode];
  }
) {
  const [row] = await db
    .update(club)
    .set({
      name: data.name,
      description: data.description ?? undefined,
      invitationCode: data.invitationCode,
      readingMode: data.readingMode,
    })
    .where(eq(club.id, id))
    .returning();
  return row ?? null;
}

export async function deleteClubById(id: string) {
  const [row] = await db.delete(club).where(eq(club.id, id)).returning();
  return row ?? null;
}

export async function countClubsOwnedByUserId(ownerId: string) {
  const [row] = await db
    .select({ value: count() })
    .from(club)
    .where(eq(club.ownerId, ownerId));
  return Number(row?.value ?? 0);
}

export async function findOwnedClubsPaginated(
  ownerId: string,
  offset: number,
  limit: number
) {
  return db.query.club.findMany({
    where: (clubRow, { eq }) => eq(clubRow.ownerId, ownerId),
    orderBy: (clubRow, { desc }) => [desc(clubRow.createdAt)],
    offset,
    limit,
    with: {
      members: {
        columns: { id: true, userId: true, joinedAt: true },
        with: {
          user: {
            columns: { id: true, name: true, email: true, status: true },
          },
        },
      },
    },
    columns: {
      id: true,
      name: true,
      invitationCode: true,
      ownerId: true,
      status: true,
      readingMode: true,
      createdAt: true,
      description: true,
    },
  });
}
