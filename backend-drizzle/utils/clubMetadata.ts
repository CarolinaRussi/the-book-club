import { ClubJoinPolicy } from "../enums/clubJoinPolicy";
import { ClubVisibility } from "../enums/clubVisibility";
import { MeetingFormat } from "../enums/meetingFormat";
import * as locationRepository from "../repositories/locationRepository";

export const PUBLIC_CLUB_DESCRIPTION_MIN_LENGTH = 40;

export class ClubMetadataValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClubMetadataValidationError";
  }
}

export type ClubMetadataInput = {
  visibility: (typeof ClubVisibility)[keyof typeof ClubVisibility];
  joinPolicy: (typeof ClubJoinPolicy)[keyof typeof ClubJoinPolicy];
  meetingFormat: (typeof MeetingFormat)[keyof typeof MeetingFormat] | null;
  stateId: number | null;
  cityId: number | null;
  description: string;
};

const MEETING_FORMATS = new Set<string>(Object.values(MeetingFormat));

function asMeetingFormat(value: unknown) {
  return typeof value === "string" && MEETING_FORMATS.has(value)
    ? (value as ClubMetadataInput["meetingFormat"])
    : null;
}

function asId(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

async function assertCityInState(cityId: number, stateId: number) {
  const cityRow = await locationRepository.findCityById(cityId);
  if (!cityRow || cityRow.stateId !== stateId) {
    throw new ClubMetadataValidationError(
      "A cidade selecionada não pertence ao estado informado.",
    );
  }
}

function assertPublicDescription(visibility: string, description: string) {
  if (
    visibility === ClubVisibility.PUBLIC &&
    description.trim().length < PUBLIC_CLUB_DESCRIPTION_MIN_LENGTH
  ) {
    throw new ClubMetadataValidationError(
      `Clubes públicos precisam de uma descrição com pelo menos ${PUBLIC_CLUB_DESCRIPTION_MIN_LENGTH} caracteres.`,
    );
  }
}

export async function resolveClubMetadataForCreate(body: {
  visibility?: unknown;
  joinPolicy?: unknown;
  meetingFormat?: unknown;
  stateId?: unknown;
  cityId?: unknown;
  description: string;
}): Promise<ClubMetadataInput> {
  const visibility =
    body.visibility === ClubVisibility.PUBLIC
      ? ClubVisibility.PUBLIC
      : ClubVisibility.PRIVATE;

  const meetingFormat = asMeetingFormat(body.meetingFormat);
  const stateId = asId(body.stateId);
  const cityId = asId(body.cityId);

  if (!meetingFormat || stateId === null || cityId === null) {
    throw new ClubMetadataValidationError(
      "Informe formato, estado e cidade do clube.",
    );
  }

  await assertCityInState(cityId, stateId);
  assertPublicDescription(visibility, body.description);

  const joinPolicy =
    visibility === ClubVisibility.PUBLIC &&
    body.joinPolicy === ClubJoinPolicy.OPEN
      ? ClubJoinPolicy.OPEN
      : visibility === ClubVisibility.PUBLIC
        ? ClubJoinPolicy.APPROVAL
        : ClubJoinPolicy.OPEN;

  return {
    visibility,
    joinPolicy,
    meetingFormat,
    stateId,
    cityId,
    description: body.description,
  };
}

export async function resolveClubMetadataForUpdate(input: {
  visibility?: unknown;
  joinPolicy?: unknown;
  meetingFormat?: unknown;
  stateId?: unknown;
  cityId?: unknown;
  description?: string;
  current: ClubMetadataInput;
}): Promise<ClubMetadataInput> {
  const visibility =
    input.visibility === ClubVisibility.PUBLIC ||
    input.visibility === ClubVisibility.PRIVATE
      ? input.visibility
      : input.current.visibility;

  const meetingFormat =
    asMeetingFormat(input.meetingFormat) ?? input.current.meetingFormat;
  const stateId =
    input.stateId === undefined ? input.current.stateId : asId(input.stateId) ?? input.current.stateId;
  const cityId =
    input.cityId === undefined ? input.current.cityId : asId(input.cityId) ?? input.current.cityId;
  const description = input.description ?? input.current.description;

  if (visibility === ClubVisibility.PUBLIC) {
    if (!meetingFormat || stateId === null || cityId === null) {
      throw new ClubMetadataValidationError(
        "Clubes públicos precisam de formato, estado e cidade.",
      );
    }
    await assertCityInState(cityId, stateId);
    assertPublicDescription(visibility, description);
  } else if (stateId !== null && cityId !== null) {
    await assertCityInState(cityId, stateId);
  }

  const joinPolicy =
    visibility === ClubVisibility.PRIVATE
      ? ClubJoinPolicy.OPEN
      : input.joinPolicy === ClubJoinPolicy.OPEN ||
          input.joinPolicy === ClubJoinPolicy.APPROVAL
        ? input.joinPolicy
        : input.current.joinPolicy === ClubJoinPolicy.OPEN
          ? ClubJoinPolicy.OPEN
          : ClubJoinPolicy.APPROVAL;

  return {
    visibility,
    joinPolicy,
    meetingFormat,
    stateId,
    cityId,
    description,
  };
}
