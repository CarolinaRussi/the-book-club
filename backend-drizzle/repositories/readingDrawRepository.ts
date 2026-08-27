import { and, eq, inArray, lt, sql } from "drizzle-orm";
import { db } from "../db/client";
import {
  club,
  readingDraw,
  readingDrawNomination,
  readingDrawParticipant,
  readingDrawVote,
  user,
} from "../db/schema";
import { ReadingDrawStatus } from "../enums/readingDrawStatus";
import { createId } from "../utils/id";

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
      eliminatedAt: readingDrawNomination.eliminatedAt,
      eliminationRound: readingDrawNomination.eliminationRound,
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

export async function findParticipant(drawId: string, userId: string) {
  const [row] = await db
    .select()
    .from(readingDrawParticipant)
    .where(
      and(
        eq(readingDrawParticipant.drawId, drawId),
        eq(readingDrawParticipant.userId, userId),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function findNominationByDrawAndUser(
  drawId: string,
  userId: string,
) {
  const [row] = await db
    .select()
    .from(readingDrawNomination)
    .where(
      and(
        eq(readingDrawNomination.drawId, drawId),
        eq(readingDrawNomination.userId, userId),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function upsertNomination(values: {
  id: string;
  drawId: string;
  userId: string;
  title: string;
  author: string | null;
}) {
  const existing = await findNominationByDrawAndUser(
    values.drawId,
    values.userId,
  );
  if (existing) {
    const [row] = await db
      .update(readingDrawNomination)
      .set({
        title: values.title,
        author: values.author,
      })
      .where(eq(readingDrawNomination.id, existing.id))
      .returning();
    return row ?? null;
  }

  const [row] = await db
    .insert(readingDrawNomination)
    .values({
      id: values.id,
      drawId: values.drawId,
      userId: values.userId,
      title: values.title,
      author: values.author,
      confirmedAt: null,
    })
    .returning();
  return row ?? null;
}

export async function setNominationConfirmedAt(
  nominationId: string,
  confirmedAt: Date | null,
) {
  const [row] = await db
    .update(readingDrawNomination)
    .set({ confirmedAt })
    .where(eq(readingDrawNomination.id, nominationId))
    .returning();
  return row ?? null;
}

export async function findConfirmedNominations(drawId: string) {
  return db
    .select()
    .from(readingDrawNomination)
    .where(
      and(
        eq(readingDrawNomination.drawId, drawId),
        sql`${readingDrawNomination.confirmedAt} is not null`,
      ),
    );
}

export async function findStandingNominations(drawId: string) {
  return db
    .select()
    .from(readingDrawNomination)
    .where(
      and(
        eq(readingDrawNomination.drawId, drawId),
        sql`${readingDrawNomination.confirmedAt} is not null`,
        sql`${readingDrawNomination.eliminatedAt} is null`,
      ),
    );
}

export async function hasEliminationStarted(drawId: string) {
  const [row] = await db
    .select({ id: readingDrawNomination.id })
    .from(readingDrawNomination)
    .where(
      and(
        eq(readingDrawNomination.drawId, drawId),
        sql`${readingDrawNomination.eliminatedAt} is not null`,
      ),
    )
    .limit(1);
  return Boolean(row);
}

export async function findMaxEliminationRound(drawId: string) {
  const [row] = await db
    .select({
      maxRound: sql<number | null>`max(${readingDrawNomination.eliminationRound})`,
    })
    .from(readingDrawNomination)
    .where(eq(readingDrawNomination.drawId, drawId));
  return row?.maxRound == null ? 0 : Number(row.maxRound);
}

export async function eliminateNomination(input: {
  drawId: string;
  nominationId: string;
  eliminationRound: number;
  eliminatedAt: Date;
}) {
  const [row] = await db
    .update(readingDrawNomination)
    .set({
      eliminatedAt: input.eliminatedAt,
      eliminationRound: input.eliminationRound,
    })
    .where(
      and(
        eq(readingDrawNomination.id, input.nominationId),
        eq(readingDrawNomination.drawId, input.drawId),
        sql`${readingDrawNomination.confirmedAt} is not null`,
        sql`${readingDrawNomination.eliminatedAt} is null`,
      ),
    )
    .returning();
  return row ?? null;
}

export async function revealDrawWinner(input: {
  drawId: string;
  winnerNominationId: string;
  revealStartedAt: Date;
}) {
  const [row] = await db
    .update(readingDraw)
    .set({
      status: ReadingDrawStatus.AWAITING_BOOK,
      winnerNominationId: input.winnerNominationId,
      revealStartedAt: input.revealStartedAt,
    })
    .where(
      and(
        eq(readingDraw.id, input.drawId),
        eq(readingDraw.status, ReadingDrawStatus.NOMINATING),
      ),
    )
    .returning();
  return row ?? null;
}

export async function reopenDrawToNominating(drawId: string) {
  const [row] = await db
    .update(readingDraw)
    .set({
      status: ReadingDrawStatus.NOMINATING,
      winnerNominationId: null,
      winningClubBookId: null,
      revealStartedAt: null,
      voteRound: null,
    })
    .where(
      and(
        eq(readingDraw.id, drawId),
        eq(readingDraw.status, ReadingDrawStatus.AWAITING_BOOK),
      ),
    )
    .returning();
  return row ?? null;
}

export async function clearNominationEliminations(drawId: string) {
  await db
    .update(readingDrawNomination)
    .set({
      eliminatedAt: null,
      eliminationRound: null,
    })
    .where(eq(readingDrawNomination.drawId, drawId));
}

export async function deleteVotesForDraw(drawId: string) {
  await db
    .delete(readingDrawVote)
    .where(eq(readingDrawVote.drawId, drawId));
}

export async function setVoteRound(drawId: string, voteRound: number) {
  const [row] = await db
    .update(readingDraw)
    .set({ voteRound })
    .where(
      and(
        eq(readingDraw.id, drawId),
        eq(readingDraw.status, ReadingDrawStatus.NOMINATING),
      ),
    )
    .returning();
  return row ?? null;
}

export async function findVotesForRound(drawId: string, round: number) {
  return db
    .select({
      id: readingDrawVote.id,
      drawId: readingDrawVote.drawId,
      round: readingDrawVote.round,
      voterUserId: readingDrawVote.voterUserId,
      nominationId: readingDrawVote.nominationId,
      createdAt: readingDrawVote.createdAt,
    })
    .from(readingDrawVote)
    .where(
      and(
        eq(readingDrawVote.drawId, drawId),
        eq(readingDrawVote.round, round),
      ),
    );
}

export async function replaceVotesForVoterInRound(input: {
  drawId: string;
  round: number;
  voterUserId: string;
  nominationIds: string[];
}) {
  await db.transaction(async (tx) => {
    await tx
      .delete(readingDrawVote)
      .where(
        and(
          eq(readingDrawVote.drawId, input.drawId),
          eq(readingDrawVote.round, input.round),
          eq(readingDrawVote.voterUserId, input.voterUserId),
        ),
      );

    if (input.nominationIds.length === 0) {
      return;
    }

    await tx.insert(readingDrawVote).values(
      input.nominationIds.map((nominationId) => ({
        id: createId(),
        drawId: input.drawId,
        round: input.round,
        voterUserId: input.voterUserId,
        nominationId,
      })),
    );
  });
}

export async function eliminateNominationsBatch(input: {
  drawId: string;
  nominationIds: string[];
  eliminationRound: number;
  eliminatedAt: Date;
}) {
  if (input.nominationIds.length === 0) {
    return;
  }
  await db
    .update(readingDrawNomination)
    .set({
      eliminatedAt: input.eliminatedAt,
      eliminationRound: input.eliminationRound,
    })
    .where(
      and(
        eq(readingDrawNomination.drawId, input.drawId),
        inArray(readingDrawNomination.id, input.nominationIds),
        sql`${readingDrawNomination.confirmedAt} is not null`,
        sql`${readingDrawNomination.eliminatedAt} is null`,
      ),
    );
}

export async function cancelActiveDraw(drawId: string) {
  const [row] = await db
    .update(readingDraw)
    .set({ status: ReadingDrawStatus.CANCELLED })
    .where(
      and(
        eq(readingDraw.id, drawId),
        inArray(readingDraw.status, [...ACTIVE_STATUSES]),
      ),
    )
    .returning();
  return row ?? null;
}

export async function completeDrawWithClubBook(input: {
  drawId: string;
  winningClubBookId: string;
}) {
  const [row] = await db
    .update(readingDraw)
    .set({
      status: ReadingDrawStatus.COMPLETED,
      winningClubBookId: input.winningClubBookId,
    })
    .where(
      and(
        eq(readingDraw.id, input.drawId),
        eq(readingDraw.status, ReadingDrawStatus.AWAITING_BOOK),
      ),
    )
    .returning();
  return row ?? null;
}

export async function expireAllActiveDrawsPastDeadline() {
  const now = new Date();
  const rows = await db
    .update(readingDraw)
    .set({ status: ReadingDrawStatus.EXPIRED })
    .where(
      and(
        inArray(readingDraw.status, [...ACTIVE_STATUSES]),
        lt(readingDraw.deadlineAt, now),
      ),
    )
    .returning({ id: readingDraw.id });
  return rows.length;
}
