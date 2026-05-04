import { eq, count } from "drizzle-orm";
import { db } from "../db/client";
import { club, member, user } from "../db/schema";

export async function findClubIdsByUserId(userId: string) {
  const memberships = await db
    .select()
    .from(member)
    .where(eq(member.userId, userId));
  return memberships.map((m) => m.clubId);
}

export async function findClubsByIds(clubIds: string[]) {
  if (clubIds.length === 0) return [];
  return db.query.club.findMany({
    where: (c, { inArray }) => inArray(c.id, clubIds),
    orderBy: (c, { desc }) => [desc(c.status), desc(c.createdAt)],
  });
}

export async function findClubByInvitationCode(code: string) {
  const [row] = await db
    .select()
    .from(club)
    .where(eq(club.invitationCode, code))
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
  data: { name: string; description?: string; invitationCode: string }
) {
  const [row] = await db
    .update(club)
    .set({
      name: data.name,
      description: data.description ?? undefined,
      invitationCode: data.invitationCode,
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
    where: (c, { eq }) => eq(c.ownerId, ownerId),
    orderBy: (c, { desc }) => [desc(c.createdAt)],
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
      createdAt: true,
      description: true,
    },
  });
}
