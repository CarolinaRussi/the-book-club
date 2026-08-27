import { db } from "../db/client";
import { readingDraw, readingDrawParticipant } from "../db/schema";
import { ReadingDrawMode } from "../enums/readingDrawMode";
import { ReadingDrawStatus } from "../enums/readingDrawStatus";
import * as clubRepository from "../repositories/clubRepository";
import * as memberRepository from "../repositories/memberRepository";
import * as readingDrawRepository from "../repositories/readingDrawRepository";
import { generateUniqueReadingDrawShareCode } from "../utils/codeGenerator";
import { createId } from "../utils/id";

const DEFAULT_DEADLINE_MS = 4 * 60 * 60 * 1000;
const MAX_DEADLINE_MS = 14 * 24 * 60 * 60 * 1000;

export class ReadingDrawValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReadingDrawValidationError";
  }
}

export class ReadingDrawNotFoundError extends Error {
  constructor(message = "Sorteio não encontrado.") {
    super(message);
    this.name = "ReadingDrawNotFoundError";
  }
}

export class ReadingDrawActiveExistsError extends Error {
  constructor() {
    super("Já existe um sorteio ativo neste clube.");
    this.name = "ReadingDrawActiveExistsError";
  }
}

export class ReadingDrawForbiddenError extends Error {
  constructor(message = "Acesso negado a este sorteio.") {
    super(message);
    this.name = "ReadingDrawForbiddenError";
  }
}

type DrawRow = NonNullable<
  Awaited<ReturnType<typeof readingDrawRepository.findById>>
>;

function isActiveStatus(status: string) {
  return (
    status === ReadingDrawStatus.NOMINATING ||
    status === ReadingDrawStatus.AWAITING_BOOK
  );
}

function parseDeadlineAt(raw: unknown, now: Date): Date {
  if (raw === undefined || raw === null || raw === "") {
    return new Date(now.getTime() + DEFAULT_DEADLINE_MS);
  }

  const deadlineAt = raw instanceof Date ? raw : new Date(String(raw));
  if (Number.isNaN(deadlineAt.getTime())) {
    throw new ReadingDrawValidationError("Data limite inválida.");
  }
  if (deadlineAt.getTime() <= now.getTime()) {
    throw new ReadingDrawValidationError(
      "A data limite precisa ser no futuro.",
    );
  }
  if (deadlineAt.getTime() > now.getTime() + MAX_DEADLINE_MS) {
    throw new ReadingDrawValidationError(
      "A data limite pode ser no máximo 14 dias a partir de agora.",
    );
  }
  return deadlineAt;
}

async function expireDrawIfPastDeadline(draw: DrawRow): Promise<DrawRow> {
  if (!isActiveStatus(draw.status)) {
    return draw;
  }
  if (draw.deadlineAt.getTime() >= Date.now()) {
    return draw;
  }
  const expired = await readingDrawRepository.markExpired(draw.id);
  return expired ?? { ...draw, status: ReadingDrawStatus.EXPIRED };
}

async function buildRoomPayload(draw: DrawRow, viewerUserId: string) {
  const [clubRow, host, participants, nominations] = await Promise.all([
    readingDrawRepository.findClubNameById(draw.clubId),
    readingDrawRepository.findHostPublicProfile(draw.hostUserId),
    readingDrawRepository.findParticipantsWithUsers(draw.id),
    readingDrawRepository.findNominations(draw.id),
  ]);

  const participantUserIds = new Set(
    participants.map((participant) => participant.userId),
  );
  let viewerRole: "host" | "participant" | "spectator" = "spectator";
  if (viewerUserId === draw.hostUserId) {
    viewerRole = "host";
  } else if (participantUserIds.has(viewerUserId)) {
    viewerRole = "participant";
  }

  return {
    id: draw.id,
    clubId: draw.clubId,
    hostUserId: draw.hostUserId,
    mode: draw.mode,
    status: draw.status,
    shareCode: draw.shareCode,
    deadlineAt: draw.deadlineAt,
    winnerNominationId: draw.winnerNominationId,
    winningClubBookId: draw.winningClubBookId,
    voteVotesPerParticipant: draw.voteVotesPerParticipant,
    revealStartedAt: draw.revealStartedAt,
    createdAt: draw.createdAt,
    updatedAt: draw.updatedAt,
    viewerRole,
    club: clubRow,
    host,
    participants: participants.map((participant) => ({
      id: participant.id,
      userId: participant.userId,
      user: {
        id: participant.userId,
        name: participant.userName,
        nickname: participant.userNickname,
        profilePicture: participant.userProfilePicture,
      },
    })),
    nominations: nominations.map((nomination) => ({
      id: nomination.id,
      userId: nomination.userId,
      title: nomination.title,
      author: nomination.author,
      confirmedAt: nomination.confirmedAt,
    })),
  };
}

export async function createReadingDraw(input: {
  clubId: string;
  hostUserId: string;
  participantUserIds: string[];
  deadlineAt?: unknown;
}) {
  const activeClub = await clubRepository.findActiveClubById(input.clubId);
  if (!activeClub) {
    throw new ReadingDrawNotFoundError("Clube não encontrado.");
  }

  await readingDrawRepository.expireActiveDrawsPastDeadline(input.clubId);

  const existingActive = await readingDrawRepository.findActiveByClubId(
    input.clubId,
  );
  if (existingActive) {
    throw new ReadingDrawActiveExistsError();
  }

  const uniqueParticipantUserIds = [
    ...new Set(
      input.participantUserIds
        .map((userId) => userId.trim())
        .filter(Boolean),
    ),
  ];
  if (uniqueParticipantUserIds.length < 1) {
    throw new ReadingDrawValidationError(
      "Escolha pelo menos um participante.",
    );
  }

  const memberUserIds = new Set(
    await memberRepository.findActiveMemberUserIdsByClubId(input.clubId),
  );
  const invalidParticipant = uniqueParticipantUserIds.find(
    (userId) => !memberUserIds.has(userId),
  );
  if (invalidParticipant) {
    throw new ReadingDrawValidationError(
      "Todos os participantes precisam ser membros ativos do clube.",
    );
  }

  const now = new Date();
  const deadlineAt = parseDeadlineAt(input.deadlineAt, now);
  const shareCode = await generateUniqueReadingDrawShareCode(db);
  const drawId = createId();

  try {
    const created = await db.transaction(async (tx) => {
      const [drawRow] = await tx
        .insert(readingDraw)
        .values({
          id: drawId,
          clubId: input.clubId,
          hostUserId: input.hostUserId,
          mode: ReadingDrawMode.DIRECT,
          status: ReadingDrawStatus.NOMINATING,
          shareCode,
          deadlineAt,
        })
        .returning();

      if (!drawRow) {
        throw new Error("Falha ao criar sorteio.");
      }

      await tx.insert(readingDrawParticipant).values(
        uniqueParticipantUserIds.map((userId) => ({
          id: createId(),
          drawId,
          userId,
        })),
      );

      return drawRow;
    });

    return buildRoomPayload(created, input.hostUserId);
  } catch (error: unknown) {
    const pgError = error as { code?: string };
    if (pgError.code === "23505") {
      throw new ReadingDrawActiveExistsError();
    }
    throw error;
  }
}

export async function getReadingDrawByShareCode(
  shareCode: string,
  viewerUserId: string,
) {
  const trimmedCode = shareCode.trim();
  if (!trimmedCode) {
    throw new ReadingDrawNotFoundError();
  }

  const draw = await readingDrawRepository.findByShareCode(trimmedCode);
  if (!draw) {
    throw new ReadingDrawNotFoundError();
  }

  const membership = await memberRepository.findMemberByUserAndClub(
    viewerUserId,
    draw.clubId,
  );
  if (!membership) {
    throw new ReadingDrawForbiddenError();
  }

  const currentDraw = await expireDrawIfPastDeadline(draw);
  return buildRoomPayload(currentDraw, viewerUserId);
}

export async function getActiveReadingDrawForClub(
  clubId: string,
  viewerUserId: string,
) {
  await readingDrawRepository.expireActiveDrawsPastDeadline(clubId);

  const draw = await readingDrawRepository.findActiveByClubId(clubId);
  if (!draw) {
    return null;
  }

  const membership = await memberRepository.findMemberByUserAndClub(
    viewerUserId,
    clubId,
  );
  if (!membership) {
    throw new ReadingDrawForbiddenError();
  }

  const currentDraw = await expireDrawIfPastDeadline(draw);
  if (!isActiveStatus(currentDraw.status)) {
    return null;
  }

  return buildRoomPayload(currentDraw, viewerUserId);
}
