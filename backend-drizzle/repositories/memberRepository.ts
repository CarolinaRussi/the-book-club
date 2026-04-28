import { eq, desc, and, count } from "drizzle-orm";
import { db } from "../db/client";
import { member, user, club } from "../db/schema";
import { UserStatus } from "../enums/userStatus";

const activeMemberUserFilter = (clubId: string) =>
  and(eq(member.clubId, clubId), eq(user.status, UserStatus.ACTIVE));

export type MemberListRow = {
  joinedAt: typeof member.$inferSelect.joinedAt;
  userId: string;
  userName: string;
  userNickname: string;
  userBio: string | null;
  userFavoritesGenres: string[] | null;
  userProfilePicture: string | null;
  userEmail: string;
};

export async function findActiveMembersByClubPaginated(
  clubId: string,
  offset: number,
  limit: number
): Promise<MemberListRow[]> {
  const rows = await db
    .select({
      joinedAt: member.joinedAt,
      userId: user.id,
      userName: user.name,
      userNickname: user.nickname,
      userBio: user.bio,
      userFavoritesGenres: user.favoritesGenres,
      userProfilePicture: user.profilePicture,
      userEmail: user.email,
    })
    .from(member)
    .innerJoin(user, eq(member.userId, user.id))
    .where(activeMemberUserFilter(clubId))
    .orderBy(desc(user.createdAt))
    .limit(limit)
    .offset(offset);

  return rows;
}

export async function countActiveMembersByClub(clubId: string): Promise<number> {
  const [{ value: totalItems }] = await db
    .select({ value: count() })
    .from(member)
    .innerJoin(user, eq(member.userId, user.id))
    .where(activeMemberUserFilter(clubId));

  return Number(totalItems ?? 0);
}

export async function insertMember(values: {
  id: string;
  clubId: string;
  userId: string;
}): Promise<typeof member.$inferSelect | null> {
  const [row] = await db.insert(member).values(values).returning();
  return row ?? null;
}

export async function findClubNameById(
  clubId: string
): Promise<string | null> {
  const [row] = await db
    .select({ name: club.name })
    .from(club)
    .where(eq(club.id, clubId))
    .limit(1);

  return row?.name ?? null;
}

export async function findMemberById(
  memberId: string
): Promise<typeof member.$inferSelect | null> {
  const [row] = await db
    .select()
    .from(member)
    .where(eq(member.id, memberId))
    .limit(1);
  return row ?? null;
}

export async function deleteMemberById(
  memberId: string
): Promise<typeof member.$inferSelect | null> {
  const [row] = await db
    .delete(member)
    .where(eq(member.id, memberId))
    .returning();
  return row ?? null;
}
