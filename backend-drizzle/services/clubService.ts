import { db } from "../db/client";
import { ClubStatus } from "../enums/clubStatus";
import { MeetingFormat } from "../enums/meetingFormat";
import { ReadingMode } from "../enums/readingMode";
import { generateUniqueInvitationCode } from "../utils/codeGenerator";
import { createId } from "../utils/id";
import {
  ClubMetadataValidationError,
  resolveClubMetadataForCreate,
  resolveClubMetadataForUpdate,
} from "../utils/clubMetadata";
import { ClubJoinPolicy } from "../enums/clubJoinPolicy";
import { ClubVisibility } from "../enums/clubVisibility";
import * as clubRepository from "../repositories/clubRepository";
import * as memberRepository from "../repositories/memberRepository";
import * as membershipRequestRepository from "../repositories/membershipRequestRepository";
import {
  autoApprovePendingRequestsForClub,
  cancelPendingRequestsForClub,
} from "./membershipRequestService";

type DiscoverRow = Awaited<
  ReturnType<typeof clubRepository.findPublicClubsForDiscover>
>["rows"][number];

function mapDiscoverClub(
  row: DiscoverRow,
  isMember: boolean,
  hasPendingRequest: boolean,
) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    joinPolicy: row.joinPolicy,
    meetingFormat: row.meetingFormat,
    createdAt: row.createdAt,
    memberCount: Number(row.memberCount ?? 0),
    isMember,
    hasPendingRequest,
    state:
      row.stateId != null && row.stateCode && row.stateName
        ? {
            id: row.stateId,
            code: row.stateCode,
            name: row.stateName,
          }
        : null,
    city:
      row.cityId != null && row.cityName
        ? {
            id: row.cityId,
            name: row.cityName,
          }
        : null,
  };
}

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
    const updatedClub = await clubRepository.updateClubById(id, {
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

    if (!updatedClub) {
      return null;
    }

    const becamePrivate =
      currentClub.visibility !== ClubVisibility.PRIVATE &&
      metadata.visibility === ClubVisibility.PRIVATE;
    const becameOpen =
      currentClub.joinPolicy !== ClubJoinPolicy.OPEN &&
      metadata.joinPolicy === ClubJoinPolicy.OPEN &&
      metadata.visibility === ClubVisibility.PUBLIC;

    if (becamePrivate) {
      await cancelPendingRequestsForClub(id);
    } else if (becameOpen) {
      await autoApprovePendingRequestsForClub(id);
    }

    return updatedClub;
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

export async function discoverClubs(
  userId: string,
  input: {
    page: number;
    limit: number;
    meetingFormat?: string;
    stateId?: number;
    cityId?: number;
    q?: string;
  },
) {
  const meetingFormat =
    input.meetingFormat === MeetingFormat.IN_PERSON ||
    input.meetingFormat === MeetingFormat.REMOTE ||
    input.meetingFormat === MeetingFormat.HYBRID
      ? input.meetingFormat
      : undefined;

  const offset = (input.page - 1) * input.limit;
  const { rows, totalItems } =
    await clubRepository.findPublicClubsForDiscover({
      meetingFormat,
      stateId: input.stateId,
      cityId: input.cityId,
      q: input.q,
      offset,
      limit: input.limit,
    });

  const clubIds = rows.map((row) => row.id);
  const [memberClubIds, pendingClubIds] = await Promise.all([
    clubRepository.findMemberClubIdsAmong(userId, clubIds),
    membershipRequestRepository.findPendingClubIdsAmong(userId, clubIds),
  ]);

  const data = rows.map((row) =>
    mapDiscoverClub(
      row,
      memberClubIds.has(row.id),
      pendingClubIds.has(row.id),
    ),
  );
  const totalPages = Math.ceil(totalItems / input.limit) || 0;

  return {
    data,
    totalPages,
    currentPage: input.page,
    totalItems,
  };
}

export async function getPublicClubPreview(userId: string, clubId: string) {
  const row = await clubRepository.findPublicClubDiscoverRow(clubId);
  if (!row) {
    return null;
  }

  const [membership, pendingRequest] = await Promise.all([
    memberRepository.findMemberByUserAndClub(userId, clubId),
    membershipRequestRepository.findPendingByClubAndUser(clubId, userId),
  ]);

  return mapDiscoverClub(row, membership !== null, pendingRequest !== null);
}
