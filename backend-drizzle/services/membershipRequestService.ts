import { createId } from "../utils/id";
import { ClubJoinPolicy } from "../enums/clubJoinPolicy";
import { ClubVisibility } from "../enums/clubVisibility";
import { MembershipRequestStatus } from "../enums/membershipRequestStatus";
import { getFrontendUrl } from "../utils/emailConfig";
import {
  sendJoinApprovedEmail,
  sendJoinRequestAdminEmail,
} from "./emailService";
import * as clubRepository from "../repositories/clubRepository";
import * as memberRepository from "../repositories/memberRepository";
import * as membershipRequestRepository from "../repositories/membershipRequestRepository";
import * as userRepository from "../repositories/userRepository";
import {
  ClubJoinNotAllowedError,
  ClubNotJoinableError,
  DuplicateMemberJoinError,
  joinClub,
} from "./memberService";

export class MembershipRequestConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MembershipRequestConflictError";
  }
}

export class MembershipRequestNotFoundError extends Error {
  constructor() {
    super("Pedido não encontrado.");
    this.name = "MembershipRequestNotFoundError";
  }
}

async function sendEmailBestEffort(
  label: string,
  send: () => Promise<unknown>,
) {
  try {
    await send();
  } catch (error) {
    console.error(label, error);
  }
}

async function notifyJoinApproved(userId: string, clubName: string) {
  await sendEmailBestEffort(
    "Erro ao enviar e-mail de aprovação de entrada:",
    async () => {
      const memberUser = await userRepository.findUserById(userId);
      if (!memberUser?.email) return;
      await sendJoinApprovedEmail({
        to: memberUser.email,
        clubName,
        clubHomeUrl: `${getFrontendUrl()}/home`,
      });
    },
  );
}

async function notifyAdminNewRequest(input: {
  ownerId: string;
  clubName: string;
  requesterName: string;
}) {
  await sendEmailBestEffort(
    "Erro ao enviar e-mail de novo pedido ao admin:",
    async () => {
      const owner = await userRepository.findUserById(input.ownerId);
      if (!owner?.email) return;
      await sendJoinRequestAdminEmail({
        to: owner.email,
        clubName: input.clubName,
        requesterName: input.requesterName,
        manageUrl: `${getFrontendUrl()}/club/manage`,
      });
    },
  );
}

async function requirePendingOwnedBy(requestId: string, ownerUserId: string) {
  const request = await membershipRequestRepository.findById(requestId);
  if (!request || request.status !== MembershipRequestStatus.PENDING) {
    throw new MembershipRequestNotFoundError();
  }

  const ownerId = await clubRepository.findClubOwnerId(request.clubId);
  if (ownerId !== ownerUserId) {
    throw new MembershipRequestNotFoundError();
  }

  return request;
}

async function acceptRequestAsMember(userId: string, clubId: string) {
  try {
    await joinClub(userId, clubId, "invitation");
  } catch (error) {
    if (!(error instanceof DuplicateMemberJoinError)) throw error;
    await membershipRequestRepository.approvePendingByClubAndUser(
      clubId,
      userId,
    );
  }
}

export async function createJoinRequest(userId: string, clubId: string) {
  const activeClub = await clubRepository.findActiveClubById(clubId);
  if (!activeClub) {
    throw new ClubNotJoinableError();
  }

  if (
    activeClub.visibility !== ClubVisibility.PUBLIC ||
    activeClub.joinPolicy !== ClubJoinPolicy.APPROVAL
  ) {
    throw new ClubJoinNotAllowedError(
      "Este clube não aceita pedidos de entrada.",
    );
  }

  const existingMember = await memberRepository.findMemberByUserAndClub(
    userId,
    clubId,
  );
  if (existingMember) {
    throw new DuplicateMemberJoinError();
  }

  const pending = await membershipRequestRepository.findPendingByClubAndUser(
    clubId,
    userId,
  );
  if (pending) {
    throw new MembershipRequestConflictError(
      "Você já tem um pedido pendente neste clube.",
    );
  }

  try {
    const request = await membershipRequestRepository.insertMembershipRequest({
      id: createId(),
      clubId,
      userId,
    });
    if (!request) {
      throw new Error("insert_membership_request_failed");
    }

    const requester = await userRepository.findUserById(userId);
    await notifyAdminNewRequest({
      ownerId: activeClub.ownerId,
      clubName: activeClub.name,
      requesterName: requester?.name ?? "Uma leitora",
    });

    return request;
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      throw new MembershipRequestConflictError(
        "Você já tem um pedido pendente neste clube.",
      );
    }
    throw error;
  }
}

export async function listPendingJoinRequests(clubId: string) {
  const rows = await membershipRequestRepository.findPendingByClubId(clubId);
  return rows.map((row) => ({
    id: row.id,
    clubId: row.clubId,
    userId: row.userId,
    status: row.status,
    createdAt: row.createdAt,
    user: {
      id: row.userId,
      name: row.userName,
      nickname: row.userNickname,
      profilePicture: row.userProfilePicture,
    },
  }));
}

export async function approveJoinRequest(
  requestId: string,
  ownerUserId: string,
) {
  const request = await requirePendingOwnedBy(requestId, ownerUserId);

  const clubRow = await clubRepository.findActiveClubById(request.clubId);
  if (!clubRow) {
    throw new ClubNotJoinableError();
  }

  await acceptRequestAsMember(request.userId, request.clubId);
  await notifyJoinApproved(request.userId, clubRow.name);

  return { clubId: request.clubId, userId: request.userId };
}

export async function rejectJoinRequest(
  requestId: string,
  ownerUserId: string,
) {
  const request = await requirePendingOwnedBy(requestId, ownerUserId);

  const updated = await membershipRequestRepository.updateRequestStatus(
    request.id,
    MembershipRequestStatus.REJECTED,
  );
  if (!updated) {
    throw new MembershipRequestNotFoundError();
  }

  return updated;
}

export async function autoApprovePendingRequestsForClub(clubId: string) {
  const clubRow = await clubRepository.findActiveClubById(clubId);
  if (!clubRow) return { approved: 0 };

  const pending =
    await membershipRequestRepository.findPendingRequestsByClubId(clubId);

  for (const request of pending) {
    await acceptRequestAsMember(request.userId, clubId);
    await notifyJoinApproved(request.userId, clubRow.name);
  }

  return { approved: pending.length };
}

export async function cancelPendingRequestsForClub(clubId: string) {
  return membershipRequestRepository.cancelPendingByClubId(clubId);
}
