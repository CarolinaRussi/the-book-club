import { and, eq, inArray, lt } from "drizzle-orm";
import { db } from "../db/client";
import {
  club,
  readingDraw,
  readingDrawNomination,
  readingDrawParticipant,
  user,
} from "../db/schema";
import { ReadingDrawStatus } from "../enums/readingDrawStatus";

const ACTIVE_STATUSES = [
  ReadingDrawStatus.NOMINATING,
  ReadingDrawStatus.AWAITING_BOOK,
] as const;

export async function expireActiveDrawsPastDeadline(clubId?: string) {
  const now = new Date();
  const conditions = [
    inArray(readingDraw.status, [...ACTIVE_STATUSES]),
    lt(readingDraw.deadlineAt, now),
  ];
  if (clubId) {
    conditions.push(eq(readingDraw.clubId, clubId));
  }

  await db
    .update(readingDraw)
    .set({ status: ReadingDrawStatus.EXPIRED })
    .where(and(...conditions));
}

export async function findActiveByClubId(clubId: string) {
  const [row] = await db
    .select()
    .from(readingDraw)
    .where(
      and(
        eq(readingDraw.clubId, clubId),
        inArray(readingDraw.status, [...ACTIVE_STATUSES]),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function findByShareCode(shareCode: string) {
  const [row] = await db
    .select()
    .from(readingDraw)
    .where(eq(readingDraw.shareCode, shareCode))
    .limit(1);
  return row ?? null;
}

export async function findById(drawId: string) {
  const [row] = await db
    .select()
    .from(readingDraw)
    .where(eq(readingDraw.id, drawId))
    .limit(1);
  return row ?? null;
}

export async function markExpired(drawId: string) {
  const [row] = await db
    .update(readingDraw)
    .set({ status: ReadingDrawStatus.EXPIRED })
    .where(
      and(
        eq(readingDraw.id, drawId),
        inArray(readingDraw.status, [...ACTIVE_STATUSES]),
      ),
    )
    .returning();
  return row ?? null;
}

export async function findParticipantsWithUsers(drawId: string) {
  return db
    .select({
      id: readingDrawParticipant.id,
      drawId: readingDrawParticipant.drawId,
      userId: readingDrawParticipant.userId,
      userName: user.name,
      userNickname: user.nickname,
      userProfilePicture: user.profilePicture,
    })
    .from(readingDrawParticipant)
    .innerJoin(user, eq(readingDrawParticipant.userId, user.id))
    .where(eq(readingDrawParticipant.drawId, drawId));
}

export async function findNominations(drawId: string) {
  return db
    .select({
      id: readingDrawNomination.id,
      drawId: readingDrawNomination.drawId,
      userId: readingDrawNomination.userId,
      title: readingDrawNomination.title,
      author: readingDrawNomination.author,
      confirmedAt: readingDrawNomination.confirmedAt,
    })
    .from(readingDrawNomination)
    .where(eq(readingDrawNomination.drawId, drawId));
}

export async function findClubNameById(clubId: string) {
  const [row] = await db
    .select({ id: club.id, name: club.name })
    .from(club)
    .where(eq(club.id, clubId))
    .limit(1);
  return row ?? null;
}

export async function findHostPublicProfile(hostUserId: string) {
  const [row] = await db
    .select({
      id: user.id,
      name: user.name,
      nickname: user.nickname,
      profilePicture: user.profilePicture,
    })
    .from(user)
    .where(eq(user.id, hostUserId))
    .limit(1);
  return row ?? null;
}
