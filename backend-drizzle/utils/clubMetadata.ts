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

function isClubVisibility(
  value: unknown,
): value is ClubMetadataInput["visibility"] {
  return value === ClubVisibility.PRIVATE || value === ClubVisibility.PUBLIC;
}

function isClubJoinPolicy(
  value: unknown,
): value is ClubMetadataInput["joinPolicy"] {
  return value === ClubJoinPolicy.OPEN || value === ClubJoinPolicy.APPROVAL;
}

function isMeetingFormat(
  value: unknown,
): value is NonNullable<ClubMetadataInput["meetingFormat"]> {
  return (
    value === MeetingFormat.IN_PERSON ||
    value === MeetingFormat.REMOTE ||
    value === MeetingFormat.HYBRID
  );
}

function parseOptionalPositiveInt(value: unknown): number | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ClubMetadataValidationError("Cidade ou estado inválido.");
  }
  return parsed;
}

export async function resolveClubMetadataForCreate(body: {
  visibility?: unknown;
  joinPolicy?: unknown;
  meetingFormat?: unknown;
  stateId?: unknown;
  cityId?: unknown;
  description: string;
}): Promise<ClubMetadataInput> {
  const visibility = isClubVisibility(body.visibility)
    ? body.visibility
    : ClubVisibility.PRIVATE;

  const joinPolicy = isClubJoinPolicy(body.joinPolicy)
    ? body.joinPolicy
    : visibility === ClubVisibility.PUBLIC
      ? ClubJoinPolicy.APPROVAL
      : ClubJoinPolicy.OPEN;

  if (!isMeetingFormat(body.meetingFormat)) {
    throw new ClubMetadataValidationError("Informe o formato dos encontros.");
  }

  const stateId = parseOptionalPositiveInt(body.stateId);
  const cityId = parseOptionalPositiveInt(body.cityId);

  if (stateId === null || cityId === null) {
    throw new ClubMetadataValidationError("Informe estado e cidade do clube.");
  }

  await assertCityBelongsToState(cityId, stateId);
  assertPublicDescriptionIfNeeded(visibility, body.description);

  return {
    visibility,
    joinPolicy:
      visibility === ClubVisibility.PRIVATE ? ClubJoinPolicy.OPEN : joinPolicy,
    meetingFormat: body.meetingFormat,
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
  current: {
    visibility: ClubMetadataInput["visibility"];
    joinPolicy: ClubMetadataInput["joinPolicy"];
    meetingFormat: ClubMetadataInput["meetingFormat"];
    stateId: number | null;
    cityId: number | null;
    description: string;
  };
}): Promise<ClubMetadataInput> {
  const visibility = isClubVisibility(input.visibility)
    ? input.visibility
    : input.current.visibility;

  const joinPolicy = isClubJoinPolicy(input.joinPolicy)
    ? input.joinPolicy
    : visibility === ClubVisibility.PUBLIC
      ? input.current.joinPolicy === ClubJoinPolicy.OPEN
        ? ClubJoinPolicy.OPEN
        : ClubJoinPolicy.APPROVAL
      : ClubJoinPolicy.OPEN;

  if (input.meetingFormat !== undefined && input.meetingFormat !== null) {
    if (!isMeetingFormat(input.meetingFormat)) {
      throw new ClubMetadataValidationError("Formato dos encontros inválido.");
    }
  }

  const meetingFormat =
    input.meetingFormat === undefined
      ? input.current.meetingFormat
      : input.meetingFormat === null
        ? null
        : input.meetingFormat;

  const stateId =
    input.stateId === undefined
      ? input.current.stateId
      : parseOptionalPositiveInt(input.stateId);
  const cityId =
    input.cityId === undefined
      ? input.current.cityId
      : parseOptionalPositiveInt(input.cityId);

  const description = input.description ?? input.current.description;

  if (visibility === ClubVisibility.PUBLIC) {
    if (!isMeetingFormat(meetingFormat)) {
      throw new ClubMetadataValidationError(
        "Clubes públicos precisam do formato dos encontros.",
      );
    }
    if (stateId === null || cityId === null) {
      throw new ClubMetadataValidationError(
        "Clubes públicos precisam de estado e cidade.",
      );
    }
    await assertCityBelongsToState(cityId, stateId);
    assertPublicDescriptionIfNeeded(visibility, description);
  } else if (stateId !== null || cityId !== null) {
    if (stateId === null || cityId === null) {
      throw new ClubMetadataValidationError(
        "Informe estado e cidade juntos, ou deixe ambos vazios.",
      );
    }
    await assertCityBelongsToState(cityId, stateId);
    if (meetingFormat !== null && !isMeetingFormat(meetingFormat)) {
      throw new ClubMetadataValidationError("Formato dos encontros inválido.");
    }
  }

  return {
    visibility,
    joinPolicy:
      visibility === ClubVisibility.PRIVATE ? ClubJoinPolicy.OPEN : joinPolicy,
    meetingFormat: isMeetingFormat(meetingFormat) ? meetingFormat : null,
    stateId,
    cityId,
    description,
  };
}

async function assertCityBelongsToState(cityId: number, stateId: number) {
  const cityRow = await locationRepository.findCityById(cityId);
  if (!cityRow || cityRow.stateId !== stateId) {
    throw new ClubMetadataValidationError(
      "A cidade selecionada não pertence ao estado informado.",
    );
  }
}

function assertPublicDescriptionIfNeeded(
  visibility: ClubMetadataInput["visibility"],
  description: string,
) {
  if (visibility !== ClubVisibility.PUBLIC) {
    return;
  }
  if (description.trim().length < PUBLIC_CLUB_DESCRIPTION_MIN_LENGTH) {
    throw new ClubMetadataValidationError(
      `Clubes públicos precisam de uma descrição com pelo menos ${PUBLIC_CLUB_DESCRIPTION_MIN_LENGTH} caracteres.`,
    );
  }
}
