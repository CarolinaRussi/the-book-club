import { db } from "../db/client";
import { ClubStatus } from "../enums/clubStatus";
import { ReadingMode } from "../enums/readingMode";
import { generateUniqueInvitationCode } from "../utils/codeGenerator";
import { createId } from "../utils/id";
import {
  ClubMetadataValidationError,
  resolveClubMetadataForCreate,
  resolveClubMetadataForUpdate,
} from "../utils/clubMetadata";
import * as clubRepository from "../repositories/clubRepository";
import * as memberRepository from "../repositories/memberRepository";

export class ClubInvitationCodeConflictError extends Error {
  constructor() {
    super("Erro ao gerar código único, tente novamente.");
    this.name = "ClubInvitationCodeConflictError";
  }
}

export { ClubMetadataValidationError };

export async function getMyClubs(userId: string) {
  const clubIds = await clubRepository.findClubIdsByUserId(userId);
  if (clubIds.length === 0) return [];
  return clubRepository.findClubsByIds(clubIds);
}

export async function getClubByInvitationCode(invitationCode: string) {
  const clubRow = await clubRepository.findClubByInvitationCode(invitationCode);
  if (!clubRow) return null;

  const ownerName = await clubRepository.findUserNameById(clubRow.ownerId);
  return {
    id: clubRow.id,
    name: clubRow.name,
    description: clubRow.description,
    user: ownerName !== null ? { name: ownerName } : null,
  };
}

export async function createClub(input: {
  name: string;
  description: string;
  ownerId: string;
  readingMode: (typeof ReadingMode)[keyof typeof ReadingMode];
  visibility?: unknown;
  joinPolicy?: unknown;
  meetingFormat?: unknown;
  stateId?: unknown;
  cityId?: unknown;
}) {
  const metadata = await resolveClubMetadataForCreate({
    visibility: input.visibility,
    joinPolicy: input.joinPolicy,
    meetingFormat: input.meetingFormat,
    stateId: input.stateId,
    cityId: input.cityId,
    description: input.description,
  });

  try {
    const generatedCode = await generateUniqueInvitationCode(input.name, db);
    const newClub = await clubRepository.insertClub({
      id: createId(),
      name: input.name,
      description: input.description,
      invitationCode: generatedCode,
      ownerId: input.ownerId,
      status: ClubStatus.ACTIVE,
      readingMode: input.readingMode,
      visibility: metadata.visibility,
      joinPolicy: metadata.joinPolicy,
      meetingFormat: metadata.meetingFormat,
      stateId: metadata.stateId,
      cityId: metadata.cityId,
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

export async function getUserClubs(
  userId: string,
  page: number,
  limit: number,
) {
  const skip = (page - 1) * limit;
  const [clubsData, totalItems] = await Promise.all([
    clubRepository.findOwnedClubsPaginated(userId, skip, limit),
    clubRepository.countClubsOwnedByUserId(userId),
  ]);

  const totalPages = Math.ceil(totalItems / limit);
  const data = clubsData.map((clubRow) => ({
    ...clubRow,
    member: (clubRow as any).members?.map((memberRow: any) => ({
      id: memberRow.id,
      userId: memberRow.userId,
      joinedAt: memberRow.joinedAt,
      user: memberRow.user,
    })),
  }));

  return { data, totalPages, currentPage: page, totalItems };
}

export async function updateClub(
  id: string,
  input: {
    name: string;
    description?: string;
    invitationCode: string;
    readingMode?: (typeof ReadingMode)[keyof typeof ReadingMode];
    visibility?: unknown;
    joinPolicy?: unknown;
    meetingFormat?: unknown;
    stateId?: unknown;
    cityId?: unknown;
  },
) {
  const currentClub = await clubRepository.findClubById(id);
  if (!currentClub) {
    return null;
  }

  const metadata = await resolveClubMetadataForUpdate({
    visibility: input.visibility,
    joinPolicy: input.joinPolicy,
    meetingFormat: input.meetingFormat,
    stateId: input.stateId,
    cityId: input.cityId,
    description: input.description,
    current: {
      visibility: currentClub.visibility,
      joinPolicy: currentClub.joinPolicy,
      meetingFormat: currentClub.meetingFormat,
      stateId: currentClub.stateId,
      cityId: currentClub.cityId,
      description: currentClub.description,
    },
  });

  try {
    return await clubRepository.updateClubById(id, {
      name: input.name,
      description: metadata.description,
      invitationCode: input.invitationCode,
      readingMode: input.readingMode,
      visibility: metadata.visibility,
      joinPolicy: metadata.joinPolicy,
      meetingFormat: metadata.meetingFormat,
      stateId: metadata.stateId,
      cityId: metadata.cityId,
    });
  } catch (error: any) {
    if (error?.code === "23503") {
      return null;
    }
    throw error;
  }
}

export async function deleteClubById(id: string) {
  return clubRepository.deleteClubById(id);
}
