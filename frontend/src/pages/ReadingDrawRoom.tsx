import { useEffect } from "react";
import { Link, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import BrandLoadingScreen from "@/components/BrandLoadingScreen";
import ReadingDrawHostControls from "@/components/pages/reading-draw/ReadingDrawHostControls";
import ReadingDrawNominationForm from "@/components/pages/reading-draw/ReadingDrawNominationForm";
import ReadingDrawResultPanel from "@/components/pages/reading-draw/ReadingDrawResultPanel";
import ReadingDrawSharePanel from "@/components/pages/reading-draw/ReadingDrawSharePanel";
import { fetchReadingDrawByShareCode } from "@/api/queries/fetchReadingDraw";
import { useAuth } from "@/contexts/AuthContext";
import { useClub } from "@/contexts/ClubContext";
import {
  isReadingDrawLiveStatus,
  READING_DRAW_STATUS_AWAITING_BOOK,
  READING_DRAW_STATUS_COMPLETED,
  READING_DRAW_STATUS_NOMINATING,
  readingDrawStatusLabels,
} from "@/utils/constants/readingDraw";

const POLL_MS = 2000;

export default function ReadingDrawRoom() {
  const { shareCode } = useParams<{ shareCode: string }>();
  const { user } = useAuth();
  const { selectedClubId, setSelectedClubId } = useClub();

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

  const confirmedCount = readingDraw.nominations.filter(
    (nomination) => nomination.confirmedAt,
  ).length;
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
        </p>
      </div>

      {isReadingDrawLiveStatus(readingDraw.status) ? (
        <ReadingDrawSharePanel
          shareCode={readingDraw.shareCode}
          clubName={readingDraw.club?.name}
        />
      ) : null}

      {isNominating && isParticipant && user?.id ? (
        <ReadingDrawNominationForm
          readingDraw={readingDraw}
          shareCode={shareCode}
          userId={user.id}
        />
      ) : null}

      {isNominating && isHost ? (
        <ReadingDrawHostControls
          readingDraw={readingDraw}
          shareCode={shareCode}
        />
      ) : null}

      {isAwaitingBook || isCompleted ? (
        <ReadingDrawResultPanel
          readingDraw={readingDraw}
          shareCode={shareCode}
          isHost={isHost}
        />
      ) : null}

      <ul className="space-y-2">
        {readingDraw.participants.map((participant) => {
          const nomination = readingDraw.nominations.find(
            (item) => item.userId === participant.userId,
          );
          const ready = Boolean(nomination?.confirmedAt);
          return (
            <li
              key={participant.id}
              className="flex items-center justify-between gap-3 rounded-md border border-muted px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {participant.user.nickname || participant.user.name}
                  {participant.userId === readingDraw.hostUserId
                    ? " (anfitrião)"
                    : ""}
                </p>
                {nomination?.title ? (
                  <p className="truncate text-muted-foreground">
                    {nomination.title}
                    {nomination.author ? ` — ${nomination.author}` : ""}
                  </p>
                ) : null}
              </div>
              <span
                className={
                  ready
                    ? "shrink-0 text-primary"
                    : "shrink-0 text-muted-foreground"
                }
              >
                {ready ? "Pronto" : "Aguardando"}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
