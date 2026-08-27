import { randomInt } from "crypto";
import { db } from "../db/client";
import { readingDraw, readingDrawParticipant } from "../db/schema";
import { ReadingDrawMode, type ReadingDrawModeValue } from "../enums/readingDrawMode";
import { ReadingDrawStatus } from "../enums/readingDrawStatus";
import * as bookRepository from "../repositories/bookRepository";
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
  const [clubRow, host, participants, nominations, roundVotes] =
    await Promise.all([
      readingDrawRepository.findClubNameById(draw.clubId),
      readingDrawRepository.findHostPublicProfile(draw.hostUserId),
      readingDrawRepository.findParticipantsWithUsers(draw.id),
      readingDrawRepository.findNominations(draw.id),
      draw.voteRound != null
        ? readingDrawRepository.findVotesForRound(draw.id, draw.voteRound)
        : Promise.resolve([]),
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

  const voterUserIdsWhoVoted = [
    ...new Set(roundVotes.map((vote) => vote.voterUserId)),
  ];
  const myVoteNominationIds = roundVotes
    .filter((vote) => vote.voterUserId === viewerUserId)
    .map((vote) => vote.nominationId);

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
    voteRound: draw.voteRound,
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
      eliminatedAt: nomination.eliminatedAt,
      eliminationRound: nomination.eliminationRound,
    })),
    myVoteNominationIds,
    votersWhoVotedCount: voterUserIdsWhoVoted.length,
    voterUserIdsWhoVoted,
  };
}

function parseCreateMode(mode: unknown): ReadingDrawModeValue {
  if (mode === undefined || mode === null || mode === "") {
    return ReadingDrawMode.DIRECT;
  }
  if (
    mode === ReadingDrawMode.DIRECT ||
    mode === ReadingDrawMode.LAST_STANDING ||
    mode === ReadingDrawMode.VOTE
  ) {
    return mode;
  }
  throw new ReadingDrawValidationError("Modo de sorteio inválido.");
}

function parseVoteVotesPerParticipant(
  mode: ReadingDrawModeValue,
  raw: unknown,
): number | null {
  if (mode !== ReadingDrawMode.VOTE) {
    return null;
  }
  if (raw === undefined || raw === null || raw === "") {
    return 3;
  }
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    throw new ReadingDrawValidationError(
      "Cada participante pode ter de 1 a 5 votos.",
    );
  }
  return value;
}

export async function createReadingDraw(input: {
  clubId: string;
  hostUserId: string;
  participantUserIds: string[];
  deadlineAt?: unknown;
  mode?: unknown;
  voteVotesPerParticipant?: unknown;
}) {
  const mode = parseCreateMode(input.mode);
  const voteVotesPerParticipant = parseVoteVotesPerParticipant(
    mode,
    input.voteVotesPerParticipant,
  );
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
          mode,
          status: ReadingDrawStatus.NOMINATING,
          shareCode,
          deadlineAt,
          voteVotesPerParticipant,
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

async function loadNominatingDrawForParticipant(
  drawId: string,
  userId: string,
) {
  const draw = await readingDrawRepository.findById(drawId);
  if (!draw) {
    throw new ReadingDrawNotFoundError();
  }

  const membership = await memberRepository.findMemberByUserAndClub(
    userId,
    draw.clubId,
  );
  if (!membership) {
    throw new ReadingDrawForbiddenError();
  }

  const currentDraw = await expireDrawIfPastDeadline(draw);
  if (currentDraw.status !== ReadingDrawStatus.NOMINATING) {
    throw new ReadingDrawValidationError(
      "Não é possível alterar indicações neste momento.",
    );
  }

  if (await readingDrawRepository.hasEliminationStarted(currentDraw.id)) {
    throw new ReadingDrawValidationError(
      "As indicações estão travadas: a eliminação já começou.",
    );
  }

  if (currentDraw.voteRound != null) {
    throw new ReadingDrawValidationError(
      "As indicações estão travadas: a votação já começou.",
    );
  }

  const participant = await readingDrawRepository.findParticipant(
    currentDraw.id,
    userId,
  );
  if (!participant) {
    throw new ReadingDrawForbiddenError(
      "Apenas participantes podem indicar um livro.",
    );
  }

  return currentDraw;
}

export async function upsertReadingDrawNomination(input: {
  drawId: string;
  userId: string;
  title: unknown;
  author?: unknown;
}) {
  const draw = await loadNominatingDrawForParticipant(
    input.drawId,
    input.userId,
  );

  const title = typeof input.title === "string" ? input.title.trim() : "";
  if (!title) {
    throw new ReadingDrawValidationError("Informe o título do livro.");
  }
  if (title.length > 255) {
    throw new ReadingDrawValidationError(
      "O título pode ter no máximo 255 caracteres.",
    );
  }

  let author: string | null = null;
  if (input.author !== undefined && input.author !== null) {
    const authorText = String(input.author).trim();
    if (authorText.length > 255) {
      throw new ReadingDrawValidationError(
        "O autor pode ter no máximo 255 caracteres.",
      );
    }
    author = authorText || null;
  }

  const existing = await readingDrawRepository.findNominationByDrawAndUser(
    draw.id,
    input.userId,
  );
  if (existing?.confirmedAt) {
    throw new ReadingDrawValidationError(
      "Desfaça a confirmação (Alterar) antes de editar a indicação.",
    );
  }

  await readingDrawRepository.upsertNomination({
    id: existing?.id ?? createId(),
    drawId: draw.id,
    userId: input.userId,
    title,
    author: input.author === undefined && existing ? existing.author : author,
  });

  const freshDraw = await readingDrawRepository.findById(draw.id);
  if (!freshDraw) {
    throw new ReadingDrawNotFoundError();
  }
  return buildRoomPayload(freshDraw, input.userId);
}

export async function confirmReadingDrawNomination(
  drawId: string,
  userId: string,
) {
  const draw = await loadNominatingDrawForParticipant(drawId, userId);

  const nomination = await readingDrawRepository.findNominationByDrawAndUser(
    draw.id,
    userId,
  );
  if (!nomination || !nomination.title.trim()) {
    throw new ReadingDrawValidationError(
      "Indique um livro antes de confirmar.",
    );
  }
  if (nomination.confirmedAt) {
    const freshDraw = await readingDrawRepository.findById(draw.id);
    if (!freshDraw) {
      throw new ReadingDrawNotFoundError();
    }
    return buildRoomPayload(freshDraw, userId);
  }

  await readingDrawRepository.setNominationConfirmedAt(
    nomination.id,
    new Date(),
  );

  const freshDraw = await readingDrawRepository.findById(draw.id);
  if (!freshDraw) {
    throw new ReadingDrawNotFoundError();
  }
  return buildRoomPayload(freshDraw, userId);
}

export async function unconfirmReadingDrawNomination(
  drawId: string,
  userId: string,
) {
  const draw = await loadNominatingDrawForParticipant(drawId, userId);

  const nomination = await readingDrawRepository.findNominationByDrawAndUser(
    draw.id,
    userId,
  );
  if (!nomination) {
    throw new ReadingDrawValidationError("Nenhuma indicação para alterar.");
  }

  if (nomination.confirmedAt) {
    await readingDrawRepository.setNominationConfirmedAt(nomination.id, null);
  }

  const freshDraw = await readingDrawRepository.findById(draw.id);
  if (!freshDraw) {
    throw new ReadingDrawNotFoundError();
  }
  return buildRoomPayload(freshDraw, userId);
}

async function loadDrawForHost(drawId: string, hostUserId: string) {
  const draw = await readingDrawRepository.findById(drawId);
  if (!draw) {
    throw new ReadingDrawNotFoundError();
  }

  const membership = await memberRepository.findMemberByUserAndClub(
    hostUserId,
    draw.clubId,
  );
  if (!membership) {
    throw new ReadingDrawForbiddenError();
  }

  const currentDraw = await expireDrawIfPastDeadline(draw);
  if (currentDraw.hostUserId !== hostUserId) {
    throw new ReadingDrawForbiddenError(
      "Apenas quem iniciou o sorteio pode realizar esta ação.",
    );
  }

  return currentDraw;
}

export async function revealReadingDraw(drawId: string, hostUserId: string) {
  const draw = await loadDrawForHost(drawId, hostUserId);

  if (draw.mode !== ReadingDrawMode.DIRECT) {
    throw new ReadingDrawValidationError(
      draw.mode === ReadingDrawMode.LAST_STANDING
        ? "Neste modo, elimine um livro por vez."
        : "Este modo não usa sorteio direto.",
    );
  }

  if (draw.status !== ReadingDrawStatus.NOMINATING) {
    throw new ReadingDrawValidationError(
      "Este sorteio não está na fase de indicações.",
    );
  }

  const confirmed = await readingDrawRepository.findConfirmedNominations(
    draw.id,
  );
  if (confirmed.length < 2) {
    throw new ReadingDrawValidationError(
      "É preciso pelo menos 2 indicações confirmadas para sortear.",
    );
  }

  const winner = confirmed[randomInt(confirmed.length)];
  const revealStartedAt = new Date();

  const revealed = await readingDrawRepository.revealDrawWinner({
    drawId: draw.id,
    winnerNominationId: winner.id,
    revealStartedAt,
  });
  if (!revealed) {
    throw new ReadingDrawValidationError(
      "O sorteio já foi iniciado ou não está mais disponível.",
    );
  }

  return buildRoomPayload(revealed, hostUserId);
}

export async function eliminateReadingDrawNomination(
  drawId: string,
  hostUserId: string,
) {
  const draw = await loadDrawForHost(drawId, hostUserId);

  if (draw.mode !== ReadingDrawMode.LAST_STANDING) {
    throw new ReadingDrawValidationError(
      "Eliminação só está disponível no modo sobra um.",
    );
  }

  if (draw.status !== ReadingDrawStatus.NOMINATING) {
    throw new ReadingDrawValidationError(
      "Este sorteio não está na fase de eliminações.",
    );
  }

  const standing = await readingDrawRepository.findStandingNominations(
    draw.id,
  );
  if (standing.length < 2) {
    throw new ReadingDrawValidationError(
      "É preciso pelo menos 2 indicações restantes para eliminar uma.",
    );
  }

  const nextRound =
    (await readingDrawRepository.findMaxEliminationRound(draw.id)) + 1;
  const victim = standing[randomInt(standing.length)];
  const eliminatedAt = new Date();

  const eliminated = await readingDrawRepository.eliminateNomination({
    drawId: draw.id,
    nominationId: victim.id,
    eliminationRound: nextRound,
    eliminatedAt,
  });
  if (!eliminated) {
    throw new ReadingDrawValidationError(
      "Não foi possível eliminar esta indicação. Tente de novo.",
    );
  }

  const remaining = await readingDrawRepository.findStandingNominations(
    draw.id,
  );
  if (remaining.length === 1) {
    const revealed = await readingDrawRepository.revealDrawWinner({
      drawId: draw.id,
      winnerNominationId: remaining[0].id,
      revealStartedAt: eliminatedAt,
    });
    if (!revealed) {
      throw new ReadingDrawValidationError(
        "A eliminação ocorreu, mas o sorteio já não estava disponível.",
      );
    }
    return buildRoomPayload(revealed, hostUserId);
  }

  const freshDraw = await readingDrawRepository.findById(draw.id);
  if (!freshDraw) {
    throw new ReadingDrawNotFoundError();
  }
  return buildRoomPayload(freshDraw, hostUserId);
}

export async function cancelReadingDraw(drawId: string, hostUserId: string) {
  const draw = await loadDrawForHost(drawId, hostUserId);

  if (!isActiveStatus(draw.status)) {
    throw new ReadingDrawValidationError("Este sorteio já foi encerrado.");
  }

  if (draw.status === ReadingDrawStatus.AWAITING_BOOK) {
    const reopened = await readingDrawRepository.reopenDrawToNominating(
      draw.id,
    );
    if (!reopened) {
      throw new ReadingDrawValidationError(
        "Não foi possível reabrir este sorteio.",
      );
    }
    await readingDrawRepository.clearNominationEliminations(draw.id);
    await readingDrawRepository.deleteVotesForDraw(draw.id);
    const freshDraw = await readingDrawRepository.findById(draw.id);
    if (!freshDraw) {
      throw new ReadingDrawNotFoundError();
    }
    return buildRoomPayload(freshDraw, hostUserId);
  }

  const cancelled = await readingDrawRepository.cancelActiveDraw(draw.id);
  if (!cancelled) {
    throw new ReadingDrawValidationError(
      "Não foi possível cancelar este sorteio.",
    );
  }

  return buildRoomPayload(cancelled, hostUserId);
}

export async function openReadingDrawVote(drawId: string, hostUserId: string) {
  const draw = await loadDrawForHost(drawId, hostUserId);

  if (draw.mode !== ReadingDrawMode.VOTE) {
    throw new ReadingDrawValidationError(
      "Abrir votação só está disponível no modo votação.",
    );
  }

  if (draw.status !== ReadingDrawStatus.NOMINATING) {
    throw new ReadingDrawValidationError(
      "Este sorteio não está na fase de indicações.",
    );
  }

  if (draw.voteRound != null) {
    throw new ReadingDrawValidationError("A votação já foi aberta.");
  }

  const confirmed = await readingDrawRepository.findConfirmedNominations(
    draw.id,
  );
  if (confirmed.length < 2) {
    throw new ReadingDrawValidationError(
      "É preciso pelo menos 2 indicações confirmadas para abrir a votação.",
    );
  }

  const opened = await readingDrawRepository.setVoteRound(draw.id, 1);
  if (!opened) {
    throw new ReadingDrawValidationError(
      "Não foi possível abrir a votação.",
    );
  }

  return buildRoomPayload(opened, hostUserId);
}

export async function castReadingDrawVotes(input: {
  drawId: string;
  userId: string;
  nominationIds: unknown;
}) {
  const draw = await readingDrawRepository.findById(input.drawId);
  if (!draw) {
    throw new ReadingDrawNotFoundError();
  }

  const membership = await memberRepository.findMemberByUserAndClub(
    input.userId,
    draw.clubId,
  );
  if (!membership) {
    throw new ReadingDrawForbiddenError();
  }

  const currentDraw = await expireDrawIfPastDeadline(draw);
  if (currentDraw.mode !== ReadingDrawMode.VOTE) {
    throw new ReadingDrawValidationError(
      "Este sorteio não está no modo votação.",
    );
  }
  if (currentDraw.status !== ReadingDrawStatus.NOMINATING) {
    throw new ReadingDrawValidationError(
      "A votação não está aberta neste momento.",
    );
  }
  if (currentDraw.voteRound == null) {
    throw new ReadingDrawValidationError(
      "Aguarde o host abrir a votação.",
    );
  }

  const participant = await readingDrawRepository.findParticipant(
    currentDraw.id,
    input.userId,
  );
  if (!participant) {
    throw new ReadingDrawForbiddenError(
      "Apenas participantes podem votar.",
    );
  }

  if (!Array.isArray(input.nominationIds)) {
    throw new ReadingDrawValidationError(
      "Informe a lista de indicações (nominationIds).",
    );
  }

  const uniqueNominationIds = [
    ...new Set(
      input.nominationIds
        .map((nominationId) => String(nominationId).trim())
        .filter(Boolean),
    ),
  ];

  const votesAllowed = currentDraw.voteVotesPerParticipant ?? 1;
  if (uniqueNominationIds.length > votesAllowed) {
    throw new ReadingDrawValidationError(
      `Você pode escolher no máximo ${votesAllowed} livro(s).`,
    );
  }

  const standing = await readingDrawRepository.findStandingNominations(
    currentDraw.id,
  );
  const standingIds = new Set(standing.map((nomination) => nomination.id));
  const invalidNomination = uniqueNominationIds.find(
    (nominationId) => !standingIds.has(nominationId),
  );
  if (invalidNomination) {
    throw new ReadingDrawValidationError(
      "Só é possível votar em indicações ativas desta rodada.",
    );
  }

  await readingDrawRepository.replaceVotesForVoterInRound({
    drawId: currentDraw.id,
    round: currentDraw.voteRound,
    voterUserId: input.userId,
    nominationIds: uniqueNominationIds,
  });

  const freshDraw = await readingDrawRepository.findById(currentDraw.id);
  if (!freshDraw) {
    throw new ReadingDrawNotFoundError();
  }
  return buildRoomPayload(freshDraw, input.userId);
}

export async function closeReadingDrawVote(drawId: string, hostUserId: string) {
  const draw = await loadDrawForHost(drawId, hostUserId);

  if (draw.mode !== ReadingDrawMode.VOTE) {
    throw new ReadingDrawValidationError(
      "Fechar votação só está disponível no modo votação.",
    );
  }

  if (draw.status !== ReadingDrawStatus.NOMINATING) {
    throw new ReadingDrawValidationError(
      "Este sorteio não está na fase de votação.",
    );
  }

  if (draw.voteRound == null) {
    throw new ReadingDrawValidationError("A votação ainda não foi aberta.");
  }

  const standing = await readingDrawRepository.findStandingNominations(
    draw.id,
  );
  if (standing.length < 1) {
    throw new ReadingDrawValidationError(
      "Não há indicações elegíveis para fechar a votação.",
    );
  }

  const votes = await readingDrawRepository.findVotesForRound(
    draw.id,
    draw.voteRound,
  );
  if (votes.length < 1) {
    throw new ReadingDrawValidationError(
      "É preciso pelo menos um voto para fechar a votação.",
    );
  }

  const tally = new Map<string, number>();
  for (const nomination of standing) {
    tally.set(nomination.id, 0);
  }
  for (const vote of votes) {
    if (!tally.has(vote.nominationId)) continue;
    tally.set(vote.nominationId, (tally.get(vote.nominationId) ?? 0) + 1);
  }

  let topCount = -1;
  for (const count of tally.values()) {
    if (count > topCount) topCount = count;
  }

  const tiedIds = [...tally.entries()]
    .filter(([, count]) => count === topCount)
    .map(([nominationId]) => nominationId);

  const closedAt = new Date();

  if (tiedIds.length === 1) {
    const revealed = await readingDrawRepository.revealDrawWinner({
      drawId: draw.id,
      winnerNominationId: tiedIds[0],
      revealStartedAt: closedAt,
    });
    if (!revealed) {
      throw new ReadingDrawValidationError(
        "Não foi possível registrar o resultado da votação.",
      );
    }
    return buildRoomPayload(revealed, hostUserId);
  }

  const eliminatedIds = standing
    .filter((nomination) => !tiedIds.includes(nomination.id))
    .map((nomination) => nomination.id);

  await readingDrawRepository.eliminateNominationsBatch({
    drawId: draw.id,
    nominationIds: eliminatedIds,
    eliminationRound: draw.voteRound,
    eliminatedAt: closedAt,
  });

  const nextRound = draw.voteRound + 1;
  const advanced = await readingDrawRepository.setVoteRound(
    draw.id,
    nextRound,
  );
  if (!advanced) {
    throw new ReadingDrawValidationError(
      "Empate registrado, mas não foi possível abrir a próxima rodada.",
    );
  }

  return buildRoomPayload(advanced, hostUserId);
}

export async function completeReadingDraw(input: {
  drawId: string;
  hostUserId: string;
  clubBookId: unknown;
}) {
  const draw = await loadDrawForHost(input.drawId, input.hostUserId);

  if (draw.status !== ReadingDrawStatus.AWAITING_BOOK) {
    throw new ReadingDrawValidationError(
      "Só é possível concluir o sorteio após o resultado.",
    );
  }

  const clubBookId =
    typeof input.clubBookId === "string" ? input.clubBookId.trim() : "";
  if (!clubBookId) {
    throw new ReadingDrawValidationError(
      "Informe o livro adicionado (clubBookId).",
    );
  }

  const clubBookRow = await bookRepository.findActiveClubBookById(clubBookId);
  if (!clubBookRow || clubBookRow.clubId !== draw.clubId) {
    throw new ReadingDrawValidationError("Livro inválido para este clube.");
  }

  if (!draw.winnerNominationId) {
    throw new ReadingDrawValidationError(
      "Sorteio sem indicação vencedora; não é possível concluir.",
    );
  }

  const nominations = await readingDrawRepository.findNominations(draw.id);
  const winnerNomination = nominations.find(
    (nomination) => nomination.id === draw.winnerNominationId,
  );
  if (!winnerNomination) {
    throw new ReadingDrawValidationError(
      "Indicação vencedora não encontrada.",
    );
  }

  await bookRepository.updateClubBookSuggestedByUserId(
    clubBookId,
    winnerNomination.userId,
  );

  const completed = await readingDrawRepository.completeDrawWithClubBook({
    drawId: draw.id,
    winningClubBookId: clubBookId,
  });
  if (!completed) {
    throw new ReadingDrawValidationError(
      "Não foi possível concluir este sorteio.",
    );
  }

  return buildRoomPayload(completed, input.hostUserId);
}

export async function expireOverdueReadingDraws() {
  const expired =
    await readingDrawRepository.expireAllActiveDrawsPastDeadline();
  return { expired };
}
