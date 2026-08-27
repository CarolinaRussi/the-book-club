import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import BrandLoadingScreen from "@/components/BrandLoadingScreen";
import ReadingDrawEliminationBeat, {
  READING_DRAW_ELIMINATION_DURATION_MS,
} from "@/components/pages/reading-draw/ReadingDrawEliminationBeat";
import ReadingDrawHostControls from "@/components/pages/reading-draw/ReadingDrawHostControls";
import ReadingDrawNominationForm from "@/components/pages/reading-draw/ReadingDrawNominationForm";
import ReadingDrawResultPanel from "@/components/pages/reading-draw/ReadingDrawResultPanel";
import ReadingDrawSharePanel from "@/components/pages/reading-draw/ReadingDrawSharePanel";
import ReadingDrawShelfReveal, {
  READING_DRAW_REVEAL_DURATION_MS,
} from "@/components/pages/reading-draw/ReadingDrawShelfReveal";
import ReadingDrawVotePanel from "@/components/pages/reading-draw/ReadingDrawVotePanel";
import { fetchReadingDrawByShareCode } from "@/api/queries/fetchReadingDraw";
import { useAuth } from "@/contexts/AuthContext";
import { useClub } from "@/contexts/ClubContext";
import {
  isReadingDrawLiveStatus,
  READING_DRAW_MODE_LAST_STANDING,
  READING_DRAW_MODE_VOTE,
  READING_DRAW_STATUS_AWAITING_BOOK,
  READING_DRAW_STATUS_COMPLETED,
  READING_DRAW_STATUS_NOMINATING,
  readingDrawModeLabels,
  readingDrawStatusLabels,
} from "@/utils/constants/readingDraw";
import type { ReadingDrawCreateMode } from "@/types/IReadingDraw";

const POLL_MS = 2000;

function revealStorageKey(drawId: string, revealStartedAt: string) {
  return `reading-draw-reveal:${drawId}:${revealStartedAt}`;
}

function eliminationStorageKey(drawId: string, elimKey: string) {
  return `reading-draw-elim:${drawId}:${elimKey}`;
}

export default function ReadingDrawRoom() {
  const { shareCode } = useParams<{ shareCode: string }>();
  const { user } = useAuth();
  const { selectedClubId, setSelectedClubId } = useClub();
  const [revealDone, setRevealDone] = useState(false);
  const [elimBeatDoneKey, setElimBeatDoneKey] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["readingDraw", shareCode],
    queryFn: () => fetchReadingDrawByShareCode(shareCode!),
    enabled: !!user && !!shareCode,
    refetchInterval: (query) => {
      const status = query.state.data?.readingDraw.status;
      if (status && isReadingDrawLiveStatus(status)) {
        return POLL_MS;
      }
      return false;
    },
  });

  const readingDraw = data?.readingDraw;

  useEffect(() => {
    if (readingDraw?.clubId && readingDraw.clubId !== selectedClubId) {
      setSelectedClubId(readingDraw.clubId);
    }
  }, [readingDraw?.clubId, selectedClubId, setSelectedClubId]);

  const latestEliminated = useMemo(() => {
    if (!readingDraw) return null;
    const eliminated = readingDraw.nominations.filter(
      (nomination) => nomination.eliminatedAt,
    );
    if (eliminated.length === 0) return null;
    return [...eliminated].sort(
      (left, right) =>
        (right.eliminationRound ?? 0) - (left.eliminationRound ?? 0),
    )[0];
  }, [readingDraw]);

  const elimKey =
    latestEliminated?.eliminatedAt != null
      ? `${latestEliminated.id}:${latestEliminated.eliminatedAt}`
      : null;

  useEffect(() => {
    if (!readingDraw) return;

    if (readingDraw.status === READING_DRAW_STATUS_COMPLETED) {
      setRevealDone(true);
      return;
    }

    if (
      readingDraw.status !== READING_DRAW_STATUS_AWAITING_BOOK ||
      !readingDraw.revealStartedAt
    ) {
      setRevealDone(false);
      return;
    }

    if (readingDraw.mode === READING_DRAW_MODE_LAST_STANDING) {
      return;
    }

    const key = revealStorageKey(readingDraw.id, readingDraw.revealStartedAt);
    const elapsed =
      Date.now() - new Date(readingDraw.revealStartedAt).getTime();
    if (
      sessionStorage.getItem(key) ||
      elapsed >= READING_DRAW_REVEAL_DURATION_MS
    ) {
      setRevealDone(true);
    } else {
      setRevealDone(false);
    }
  }, [
    readingDraw?.id,
    readingDraw?.status,
    readingDraw?.revealStartedAt,
    readingDraw?.mode,
  ]);

  useEffect(() => {
    if (!latestEliminated) {
      setElimBeatDoneKey(null);
    }
  }, [latestEliminated]);

  useEffect(() => {
    if (!readingDraw || !elimKey || !latestEliminated?.eliminatedAt) return;

    const storageKey = eliminationStorageKey(readingDraw.id, elimKey);
    const elapsed =
      Date.now() - new Date(latestEliminated.eliminatedAt).getTime();
    if (
      sessionStorage.getItem(storageKey) ||
      elapsed >= READING_DRAW_ELIMINATION_DURATION_MS
    ) {
      setElimBeatDoneKey(elimKey);
    }
  }, [readingDraw?.id, elimKey, latestEliminated?.eliminatedAt]);

  useEffect(() => {
    if (!readingDraw) return;
    if (readingDraw.mode !== READING_DRAW_MODE_LAST_STANDING) return;
    if (readingDraw.status !== READING_DRAW_STATUS_AWAITING_BOOK) return;

    if (!elimKey || elimBeatDoneKey === elimKey) {
      setRevealDone(true);
    }
  }, [
    readingDraw?.mode,
    readingDraw?.status,
    elimKey,
    elimBeatDoneKey,
  ]);

  if (!shareCode) {
    return (
      <div className="mx-auto mt-16 max-w-lg px-4 text-center">
        <p className="text-lg font-semibold text-primary">Link inválido.</p>
      </div>
    );
  }

  if (isLoading) {
    return <BrandLoadingScreen />;
  }

  if (isError || !readingDraw) {
    const status = axios.isAxiosError(error)
      ? error.response?.status
      : undefined;
    const message =
      axios.isAxiosError(error) && error.response?.data?.message
        ? String(error.response.data.message)
        : "Não foi possível abrir este sorteio.";

    return (
      <div className="mx-auto mt-16 max-w-lg space-y-4 px-4 text-center">
        <p className="text-lg font-semibold text-primary">
          {status === 403
            ? "Sem acesso a este sorteio"
            : "Sorteio não encontrado"}
        </p>
        <p className="text-warm-brown">{message}</p>
        <Link to="/home" className="text-sm text-primary underline">
          Voltar para a Home
        </Link>
      </div>
    );
  }

  const isHost = readingDraw.hostUserId === user?.id;
  const isParticipant = readingDraw.participants.some(
    (participant) => participant.userId === user?.id,
  );
  const isNominating = readingDraw.status === READING_DRAW_STATUS_NOMINATING;
  const isAwaitingBook =
    readingDraw.status === READING_DRAW_STATUS_AWAITING_BOOK;
  const isCompleted = readingDraw.status === READING_DRAW_STATUS_COMPLETED;
  const isLastStanding =
    readingDraw.mode === READING_DRAW_MODE_LAST_STANDING;
  const isVote = readingDraw.mode === READING_DRAW_MODE_VOTE;
  const voteOpened = isVote && readingDraw.voteRound != null;
  const modeLabel =
    readingDrawModeLabels[readingDraw.mode as ReadingDrawCreateMode]
      ?.title ?? readingDraw.mode;

  const showEliminationBeat =
    isLastStanding &&
    Boolean(elimKey) &&
    Boolean(latestEliminated?.eliminatedAt) &&
    elimBeatDoneKey !== elimKey;

  const showShelfReveal =
    isAwaitingBook &&
    !isLastStanding &&
    !revealDone &&
    Boolean(readingDraw.revealStartedAt) &&
    Boolean(readingDraw.winnerNominationId);

  const showSpectacle = showEliminationBeat || showShelfReveal;
  const showVoteTieBanner =
    isVote &&
    isNominating &&
    (readingDraw.voteRound ?? 0) > 1 &&
    !showSpectacle;

  const confirmedCount = readingDraw.nominations.filter(
    (nomination) => nomination.confirmedAt,
  ).length;
  const standingCount = readingDraw.nominations.filter(
    (nomination) => nomination.confirmedAt && !nomination.eliminatedAt,
  ).length;
  const remainingForElimBeat = readingDraw.nominations.filter(
    (nomination) =>
      nomination.confirmedAt &&
      !nomination.eliminatedAt &&
      nomination.id !== latestEliminated?.id,
  );
  const deadlineLabel = new Date(readingDraw.deadlineAt).toLocaleString(
    "pt-BR",
    {
      dateStyle: "short",
      timeStyle: "short",
    },
  );

  return (
    <div className="mx-auto mt-8 w-full max-w-2xl space-y-6 px-4 pb-16">
      <div className="space-y-2">
        <p className="text-sm text-warm-brown">
          {readingDraw.club?.name ?? "Clube"}
        </p>
        <h1 className="text-3xl font-bold text-primary">
          Sorteio da próxima leitura
        </h1>
        <p className="text-warm-brown">
          {modeLabel}
          {" · "}
          {readingDrawStatusLabels[readingDraw.status]}
          {" · "}
          Você:{" "}
          {isHost
            ? "anfitrião"
            : isParticipant
              ? "participante"
              : "espectador"}
        </p>
      </div>

      {!showSpectacle ? (
        <div className="space-y-2 rounded-lg border border-secondary/40 bg-background p-4 text-sm">
          <p>
            <span className="font-medium text-primary">Prazo:</span>{" "}
            {deadlineLabel}
          </p>
          <p>
            <span className="font-medium text-primary">Participantes:</span>{" "}
            {readingDraw.participants.length}
            {" · "}
            <span className="font-medium text-primary">Confirmados:</span>{" "}
            {confirmedCount}
            {isLastStanding || isVote ? (
              <>
                {" · "}
                <span className="font-medium text-primary">Restantes:</span>{" "}
                {standingCount}
              </>
            ) : null}
            {voteOpened ? (
              <>
                {" · "}
                <span className="font-medium text-primary">Votaram:</span>{" "}
                {readingDraw.votersWhoVotedCount ?? 0}/
                {readingDraw.participants.length}
              </>
            ) : null}
          </p>
        </div>
      ) : null}

      {isReadingDrawLiveStatus(readingDraw.status) && !showSpectacle ? (
        <ReadingDrawSharePanel
          shareCode={readingDraw.shareCode}
          clubName={readingDraw.club?.name}
        />
      ) : null}

      {showVoteTieBanner ? (
        <div className="rounded-lg border border-amber-600/40 bg-amber-500/10 px-4 py-3 text-sm text-foreground">
          Empate — nova rodada com {standingCount}{" "}
          {standingCount === 1 ? "livro" : "livros"}. Votem de novo!
        </div>
      ) : null}

      {isNominating && isParticipant && user?.id && !showEliminationBeat ? (
        <ReadingDrawNominationForm
          readingDraw={readingDraw}
          shareCode={shareCode}
          userId={user.id}
        />
      ) : null}

      {isNominating &&
      isParticipant &&
      voteOpened &&
      !showEliminationBeat ? (
        <ReadingDrawVotePanel
          readingDraw={readingDraw}
          shareCode={shareCode}
        />
      ) : null}

      {isNominating && isHost && !showEliminationBeat ? (
        <ReadingDrawHostControls
          readingDraw={readingDraw}
          shareCode={shareCode}
          actionLocked={showEliminationBeat}
        />
      ) : null}

      {showEliminationBeat && latestEliminated?.eliminatedAt ? (
        <ReadingDrawEliminationBeat
          eliminated={latestEliminated}
          remaining={remainingForElimBeat}
          eliminatedAt={latestEliminated.eliminatedAt}
          onFinished={() => {
            sessionStorage.setItem(
              eliminationStorageKey(readingDraw.id, elimKey!),
              "1",
            );
            setElimBeatDoneKey(elimKey);
          }}
        />
      ) : null}

      {showShelfReveal ? (
        <ReadingDrawShelfReveal
          nominations={readingDraw.nominations}
          winnerNominationId={readingDraw.winnerNominationId!}
          revealStartedAt={readingDraw.revealStartedAt!}
          drawId={readingDraw.id}
          onFinished={() => {
            sessionStorage.setItem(
              revealStorageKey(readingDraw.id, readingDraw.revealStartedAt!),
              "1",
            );
            setRevealDone(true);
          }}
        />
      ) : null}

      {(isAwaitingBook && revealDone && !showEliminationBeat) ||
      isCompleted ? (
        <ReadingDrawResultPanel
          readingDraw={readingDraw}
          shareCode={shareCode}
          isHost={isHost}
        />
      ) : null}

      {!showSpectacle ? (
        <ul className="space-y-2">
          {readingDraw.participants.map((participant) => {
            const nomination = readingDraw.nominations.find(
              (item) => item.userId === participant.userId,
            );
            const eliminated = Boolean(nomination?.eliminatedAt);
            const ready = Boolean(nomination?.confirmedAt) && !eliminated;
            const hasVoted =
              voteOpened &&
              (readingDraw.voterUserIdsWhoVoted ?? []).includes(
                participant.userId,
              );
            return (
              <li
                key={participant.id}
                className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm ${
                  eliminated
                    ? "border-muted/60 bg-muted/20 opacity-70"
                    : "border-muted"
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {participant.user.nickname || participant.user.name}
                    {participant.userId === readingDraw.hostUserId
                      ? " (anfitrião)"
                      : ""}
                  </p>
                  {nomination?.title ? (
                    <p
                      className={`truncate text-muted-foreground ${
                        eliminated ? "line-through" : ""
                      }`}
                    >
                      {nomination.title}
                      {nomination.author ? ` — ${nomination.author}` : ""}
                    </p>
                  ) : null}
                </div>
                <span
                  className={
                    eliminated
                      ? "shrink-0 text-destructive"
                      : voteOpened
                        ? hasVoted
                          ? "shrink-0 text-primary"
                          : "shrink-0 text-muted-foreground"
                        : ready
                          ? "shrink-0 text-primary"
                          : "shrink-0 text-muted-foreground"
                  }
                >
                  {eliminated
                    ? "Fora"
                    : voteOpened
                      ? hasVoted
                        ? "Votou"
                        : "Sem voto"
                      : ready
                        ? "Pronto"
                        : "Aguardando"}
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
