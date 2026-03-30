import { db } from "../db/client";
import { ClubStatus } from "../enums/clubStatus";
import { generateUniqueInvitationCode } from "../utils/codeGenerator";
import { createId } from "../utils/id";
import * as clubRepository from "../repositories/clubRepository";
import * as memberRepository from "../repositories/memberRepository";

export class ClubInvitationCodeConflictError extends Error {
  constructor() {
    super("Erro ao gerar código único, tente novamente.");
    this.name = "ClubInvitationCodeConflictError";
  }
}

export async function getMyClubs(userId: string) {
  const clubIds = await clubRepository.findClubIdsByUserId(userId);
  if (clubIds.length === 0) return [];
  return clubRepository.findClubsByIds(clubIds);
}

export async function getClubByInvitationCode(invitationCode: string) {
  const clubRow = await clubRepository.findClubByInvitationCode(
    invitationCode
  );
  if (!clubRow) return null;

  const ownerName = await clubRepository.findUserNameById(clubRow.ownerId);
  return {
    ...clubRow,
    user: ownerName !== null ? { name: ownerName } : null,
  };
}

export async function createClub(input: {
  name: string;
  description: string;
  ownerId: string;
}) {
  try {
    const generatedCode = await generateUniqueInvitationCode(input.name, db);
    const newClub = await clubRepository.insertClub({
      id: createId(),
      name: input.name,
      description: input.description,
      invitationCode: generatedCode,
      ownerId: input.ownerId,
      status: ClubStatus.ACTIVE,
    });

    if (!newClub) {
      throw new Error("insert_club_failed");
    }

    await memberRepository.insertMember({
      id: createId(),
      clubId: newClub.id,
      userId: input.ownerId,
    });

    return newClub;
  } catch (error: any) {
    if (error?.code === "23505") {
      throw new ClubInvitationCodeConflictError();
    }
    throw error;
  }
}

export async function getUserClubs(userId: string, page: number, limit: number) {
  const skip = (page - 1) * limit;
  const [clubsData, totalItems] = await Promise.all([
    clubRepository.findOwnedClubsPaginated(userId, skip, limit),
    clubRepository.countClubsOwnedByUserId(userId),
  ]);

  const totalPages = Math.ceil(totalItems / limit);
  const data = clubsData.map((c) => ({
    ...c,
    member: (c as any).members?.map((m: any) => ({
      id: m.id,
      userId: m.userId,
      joinedAt: m.joinedAt,
      user: m.user,
    })),
  }));

  return { data, totalPages, currentPage: page, totalItems };
}

export async function updateClub(
  id: string,
  input: { name: string; description?: string; invitationCode: string }
) {
  try {
    return await clubRepository.updateClubById(id, input);
  } catch (error: any) {
    if (error?.code === "23503") {
      return null;
    }
    throw error;
  }
}
