import { createId } from "../utils/id";
import * as memberRepository from "../repositories/memberRepository";

export class DuplicateMemberJoinError extends Error {
  constructor() {
    super("JoinClub já realizado");
    this.name = "DuplicateMemberJoinError";
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

  const data = membersRows.map((m) => ({
    joinedAt: m.joinedAt,
    user: {
      id: m.userId,
      name: m.userName,
      nickname: m.userNickname,
      bio: m.userBio,
      favoritesGenres: m.userFavoritesGenres,
      profilePicture: m.userProfilePicture,
      email: m.userEmail,
    },
  }));

  return { data, totalPages, currentPage: page, totalItems };
}

export async function joinClub(userId: string, clubId: string) {
  try {
    const newMember = await memberRepository.insertMember({
      id: createId(),
      clubId,
      userId,
    });

    if (!newMember) {
      throw new Error("insert_member_failed");
    }

    const clubName = await memberRepository.findClubNameById(clubId);

    return {
      member: {
        ...newMember,
        club: clubName !== null ? { name: clubName } : null,
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
