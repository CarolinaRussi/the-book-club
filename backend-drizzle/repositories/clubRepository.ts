import { and, count, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "../db/client";
import { city, club, member, state, user } from "../db/schema";
import { ClubStatus } from "../enums/clubStatus";
import { ClubVisibility } from "../enums/clubVisibility";
import { MeetingFormat } from "../enums/meetingFormat";
import { ReadingMode } from "../enums/readingMode";

export type DiscoverClubsFilters = {
  meetingFormat?: (typeof MeetingFormat)[keyof typeof MeetingFormat];
  stateId?: number;
  cityId?: number;
  q?: string;
  offset: number;
  limit: number;
};

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
      visibility: club.visibility,
      joinPolicy: club.joinPolicy,
      ownerId: club.ownerId,
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

export async function findClubById(clubId: string) {
  const [row] = await db
    .select()
    .from(club)
    .where(eq(club.id, clubId))
    .limit(1);
  return row ?? null;
}

function buildDiscoverWhere(filters: DiscoverClubsFilters) {
  const conditions = [
    eq(club.visibility, ClubVisibility.PUBLIC),
    eq(club.status, ClubStatus.ACTIVE),
  ];

  if (filters.meetingFormat) {
    conditions.push(eq(club.meetingFormat, filters.meetingFormat));
  }
  if (filters.stateId !== undefined) {
    conditions.push(eq(club.stateId, filters.stateId));
  }
  if (filters.cityId !== undefined) {
    conditions.push(eq(club.cityId, filters.cityId));
  }
  if (filters.q?.trim()) {
    const pattern = `%${filters.q.trim()}%`;
    conditions.push(
      or(ilike(club.name, pattern), ilike(club.description, pattern))!,
    );
  }

  return and(...conditions);
}

const discoverSelect = {
  id: club.id,
  name: club.name,
  description: club.description,
  joinPolicy: club.joinPolicy,
  meetingFormat: club.meetingFormat,
  createdAt: club.createdAt,
  stateId: state.id,
  stateCode: state.code,
  stateName: state.name,
  cityId: city.id,
  cityName: city.name,
  memberCount: sql<number>`(
    select count(*)::int from "Member" as membership
    where membership.club_id = ${club.id}
  )`,
};

export async function findPublicClubsForDiscover(
  filters: DiscoverClubsFilters,
) {
  const whereClause = buildDiscoverWhere(filters);

  const [rows, totalRow] = await Promise.all([
    db
      .select(discoverSelect)
      .from(club)
      .leftJoin(state, eq(club.stateId, state.id))
      .leftJoin(city, eq(club.cityId, city.id))
      .where(whereClause)
      .orderBy(desc(club.createdAt))
      .limit(filters.limit)
      .offset(filters.offset),
    db.select({ value: count() }).from(club).where(whereClause),
  ]);

  return {
    rows,
    totalItems: Number(totalRow[0]?.value ?? 0),
  };
}

export async function findPublicClubDiscoverRow(clubId: string) {
  const [row] = await db
    .select(discoverSelect)
    .from(club)
    .leftJoin(state, eq(club.stateId, state.id))
    .leftJoin(city, eq(club.cityId, city.id))
    .where(
      and(
        eq(club.id, clubId),
        eq(club.visibility, ClubVisibility.PUBLIC),
        eq(club.status, ClubStatus.ACTIVE),
      ),
    )
    .limit(1);

  return row ?? null;
}

export async function findMemberClubIdsAmong(
  userId: string,
  clubIds: string[],
) {
  if (clubIds.length === 0) return new Set<string>();

  const rows = await db
    .select({ clubId: member.clubId })
    .from(member)
    .where(and(eq(member.userId, userId), inArray(member.clubId, clubIds)));

  return new Set(rows.map((row) => row.clubId));
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
  data: Partial<typeof club.$inferInsert> & {
    name: string;
    invitationCode: string;
  }
) {
  const [row] = await db
    .update(club)
    .set(data)
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
      visibility: true,
      joinPolicy: true,
      meetingFormat: true,
      stateId: true,
      cityId: true,
    },
  });
}
