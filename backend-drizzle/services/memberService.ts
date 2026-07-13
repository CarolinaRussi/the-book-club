import { createId } from "../utils/id";
import * as clubRepository from "../repositories/clubRepository";
import * as memberRepository from "../repositories/memberRepository";

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

export async function getMembersFromClub(
  clubId: string,
  page: number,
  limit: number
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

export async function joinClub(userId: string, clubId: string) {
  const activeClub = await clubRepository.findActiveClubById(clubId);
  if (!activeClub) {
    throw new ClubNotJoinableError();
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
