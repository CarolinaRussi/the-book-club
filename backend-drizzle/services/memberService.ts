import { createId } from "../utils/id";
import { ClubJoinPolicy } from "../enums/clubJoinPolicy";
import { ClubVisibility } from "../enums/clubVisibility";
import * as clubRepository from "../repositories/clubRepository";
import * as memberRepository from "../repositories/memberRepository";
import * as membershipRequestRepository from "../repositories/membershipRequestRepository";

export class DuplicateMemberJoinError extends Error {
  constructor() {
    super("Você já é membro deste clube");
    this.name = "DuplicateMemberJoinError";
  }
}

export class ClubNotJoinableError extends Error {
  constructor() {
    super("Clube não encontrado ou não está aceitando novos membros.");
    this.name = "ClubNotJoinableError";
  }
}

export class ClubJoinNotAllowedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClubJoinNotAllowedError";
  }
}

export async function getMembersFromClub(
  clubId: string,
  page: number,
  limit: number,
) {
  const skip = (page - 1) * limit;
  const [membersRows, totalItems] = await Promise.all([
    memberRepository.findActiveMembersByClubPaginated(clubId, skip, limit),
    memberRepository.countActiveMembersByClub(clubId),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  const data = membersRows.map((memberRow) => ({
    id: memberRow.id,
    joinedAt: memberRow.joinedAt,
    user: {
      id: memberRow.userId,
      name: memberRow.userName,
      nickname: memberRow.userNickname,
      bio: memberRow.userBio,
      favoritesGenres: memberRow.userFavoritesGenres,
      profilePicture: memberRow.userProfilePicture,
    },
  }));

  return { data, totalPages, currentPage: page, totalItems };
}

export type JoinClubSource = "invitation" | "open_public";

export async function joinClub(
  userId: string,
  clubId: string,
  source: JoinClubSource = "invitation",
) {
  const activeClub = await clubRepository.findActiveClubById(clubId);
  if (!activeClub) {
    throw new ClubNotJoinableError();
  }

  if (source === "open_public") {
    if (
      activeClub.visibility !== ClubVisibility.PUBLIC ||
      activeClub.joinPolicy !== ClubJoinPolicy.OPEN
    ) {
      throw new ClubJoinNotAllowedError(
        "Este clube não aceita entrada direta. Peça aprovação ou use um convite.",
      );
    }
  }

  const existingMember = await memberRepository.findMemberByUserAndClub(
    userId,
    clubId,
  );
  if (existingMember) {
    throw new DuplicateMemberJoinError();
  }

  try {
    const newMember = await memberRepository.insertMember({
      id: createId(),
      clubId,
      userId,
    });

    if (!newMember) {
      throw new Error("insert_member_failed");
    }

    await membershipRequestRepository.approvePendingByClubAndUser(
      clubId,
      userId,
    );

    return {
      member: {
        ...newMember,
        club: { name: activeClub.name },
      },
    };
  } catch (error: any) {
    if (error?.code === "23505") {
      throw new DuplicateMemberJoinError();
    }
    throw error;
  }
}

export async function deleteMember(memberId: string) {
  return memberRepository.deleteMemberById(memberId);
}

export class NotClubMemberError extends Error {
  constructor() {
    super("Membro não encontrado");
    this.name = "NotClubMemberError";
  }
}

export class ClubOwnerCannotLeaveError extends Error {
  constructor() {
    super(
      "O administrador não pode sair do clube sem transferir a propriedade.",
    );
    this.name = "ClubOwnerCannotLeaveError";
  }
}

export async function leaveClub(userId: string, clubId: string) {
  const membership = await memberRepository.findMemberByUserAndClub(
    userId,
    clubId,
  );
  if (!membership) {
    throw new NotClubMemberError();
  }

  const ownerId = await clubRepository.findClubOwnerId(clubId);
  if (ownerId === userId) {
    throw new ClubOwnerCannotLeaveError();
  }

  const deleted = await memberRepository.deleteMemberById(membership.id);
  if (!deleted) {
    throw new NotClubMemberError();
  }

  return deleted;
}
