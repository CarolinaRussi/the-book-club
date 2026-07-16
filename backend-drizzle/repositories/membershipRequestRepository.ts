import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "../db/client";
import { membershipRequest, user } from "../db/schema";
import { MembershipRequestStatus } from "../enums/membershipRequestStatus";

export async function findPendingByClubAndUser(
  clubId: string,
  userId: string,
) {
  const [row] = await db
    .select()
    .from(membershipRequest)
    .where(
      and(
        eq(membershipRequest.clubId, clubId),
        eq(membershipRequest.userId, userId),
        eq(membershipRequest.status, MembershipRequestStatus.PENDING),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function findPendingClubIdsAmong(
  userId: string,
  clubIds: string[],
) {
  if (clubIds.length === 0) return new Set<string>();

  const rows = await db
    .select({ clubId: membershipRequest.clubId })
    .from(membershipRequest)
    .where(
      and(
        eq(membershipRequest.userId, userId),
        inArray(membershipRequest.clubId, clubIds),
        eq(membershipRequest.status, MembershipRequestStatus.PENDING),
      ),
    );

  return new Set(rows.map((row) => row.clubId));
}

export async function insertMembershipRequest(values: {
  id: string;
  clubId: string;
  userId: string;
}) {
  const [row] = await db
    .insert(membershipRequest)
    .values({
      ...values,
      status: MembershipRequestStatus.PENDING,
    })
    .returning();
  return row ?? null;
}

export async function findPendingByClubId(clubId: string) {
  return db
    .select({
      id: membershipRequest.id,
      clubId: membershipRequest.clubId,
      userId: membershipRequest.userId,
      status: membershipRequest.status,
      createdAt: membershipRequest.createdAt,
      userName: user.name,
      userNickname: user.nickname,
      userProfilePicture: user.profilePicture,
    })
    .from(membershipRequest)
    .innerJoin(user, eq(membershipRequest.userId, user.id))
    .where(
      and(
        eq(membershipRequest.clubId, clubId),
        eq(membershipRequest.status, MembershipRequestStatus.PENDING),
      ),
    )
    .orderBy(desc(membershipRequest.createdAt));
}

export async function findById(requestId: string) {
  const [row] = await db
    .select()
    .from(membershipRequest)
    .where(eq(membershipRequest.id, requestId))
    .limit(1);
  return row ?? null;
}

export async function updateRequestStatus(
  requestId: string,
  status:
    | typeof MembershipRequestStatus.APPROVED
    | typeof MembershipRequestStatus.REJECTED
    | typeof MembershipRequestStatus.CANCELLED,
) {
  const [row] = await db
    .update(membershipRequest)
    .set({
      status,
      resolvedAt: new Date(),
    })
    .where(eq(membershipRequest.id, requestId))
    .returning();
  return row ?? null;
}

export async function approvePendingByClubAndUser(
  clubId: string,
  userId: string,
) {
  const [row] = await db
    .update(membershipRequest)
    .set({
      status: MembershipRequestStatus.APPROVED,
      resolvedAt: new Date(),
    })
    .where(
      and(
        eq(membershipRequest.clubId, clubId),
        eq(membershipRequest.userId, userId),
        eq(membershipRequest.status, MembershipRequestStatus.PENDING),
      ),
    )
    .returning();
  return row ?? null;
}

export async function findPendingRequestsByClubId(clubId: string) {
  return db
    .select()
    .from(membershipRequest)
    .where(
      and(
        eq(membershipRequest.clubId, clubId),
        eq(membershipRequest.status, MembershipRequestStatus.PENDING),
      ),
    );
}

export async function cancelPendingByClubId(clubId: string) {
  return db
    .update(membershipRequest)
    .set({
      status: MembershipRequestStatus.CANCELLED,
      resolvedAt: new Date(),
    })
    .where(
      and(
        eq(membershipRequest.clubId, clubId),
        eq(membershipRequest.status, MembershipRequestStatus.PENDING),
      ),
    )
    .returning();
}
