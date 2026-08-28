import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  cancelReadingDraw,
  closeReadingDrawVote,
  eliminateReadingDrawNomination,
  openReadingDrawVote,
  revealReadingDraw,
} from "@/api/mutations/readingDrawMutate";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { IApiError } from "@/types/IApi";
import type { IReadingDraw } from "@/types/IReadingDraw";
import {
  READING_DRAW_MODE_LAST_STANDING,
  READING_DRAW_MODE_VOTE,
} from "@/utils/constants/readingDraw";

type ReadingDrawHostControlsProps = {
  readingDraw: IReadingDraw;
  shareCode: string;
  actionLocked?: boolean;
};

export default function ReadingDrawHostControls({
  readingDraw,
  shareCode,
  actionLocked = false,
}: ReadingDrawHostControlsProps) {
  const queryClient = useQueryClient();
  const [continueOpen, setContinueOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const isLastStanding =
    readingDraw.mode === READING_DRAW_MODE_LAST_STANDING;
  const isVote = readingDraw.mode === READING_DRAW_MODE_VOTE;
  const voteOpened = readingDraw.voteRound != null;
  const eliminationsStarted = readingDraw.nominations.some(
    (nomination) => nomination.eliminatedAt,
  );

  const pendingParticipants = readingDraw.participants.filter((participant) => {
    const nomination = readingDraw.nominations.find(
      (item) => item.userId === participant.userId,
    );
    return !nomination?.confirmedAt;
  });

  const confirmedCount = readingDraw.nominations.filter(
    (nomination) => nomination.confirmedAt,
  ).length;
  const standingCount = readingDraw.nominations.filter(
    (nomination) => nomination.confirmedAt && !nomination.eliminatedAt,
  ).length;
  const allReady = pendingParticipants.length === 0;
  const canStart = confirmedCount >= 2;
  const canEliminate = standingCount >= 2;
  const canCloseVote = (readingDraw.votersWhoVotedCount ?? 0) >= 1;

  const invalidateRoom = (next: IReadingDraw) => {
    queryClient.setQueryData(["readingDraw", shareCode], {
      readingDraw: next,
    });
    queryClient.invalidateQueries({
      queryKey: ["activeReadingDraw", readingDraw.clubId],
    });
  };

  const { mutate: revealMutate, isPending: isRevealing } = useMutation({
    mutationFn: () => revealReadingDraw(readingDraw.id),
    onSuccess: (result) => {
      invalidateRoom(result.readingDraw);
      setContinueOpen(false);
      toast.success(result.message || "Sorteio realizado!");
    },
    onError: (error: IApiError) => {
      toast.error(error.message || "Erro ao sortear.");
    },
  });

  const { mutate: eliminateMutate, isPending: isEliminating } = useMutation({
    mutationFn: () => eliminateReadingDrawNomination(readingDraw.id),
    onSuccess: (result) => {
      invalidateRoom(result.readingDraw);
      setContinueOpen(false);
      toast.success(result.message || "Um livro foi eliminado.");
    },
    onError: (error: IApiError) => {
      toast.error(error.message || "Erro ao eliminar.");
    },
  });

  const { mutate: openVoteMutate, isPending: isOpeningVote } = useMutation({
    mutationFn: () => openReadingDrawVote(readingDraw.id),
    onSuccess: (result) => {
      invalidateRoom(result.readingDraw);
      setContinueOpen(false);
      toast.success(result.message || "Votação aberta!");
    },
    onError: (error: IApiError) => {
      toast.error(error.message || "Erro ao abrir votação.");
    },
  });

  const { mutate: closeVoteMutate, isPending: isClosingVote } = useMutation({
    mutationFn: () => closeReadingDrawVote(readingDraw.id),
    onSuccess: (result) => {
      invalidateRoom(result.readingDraw);
      toast.success(result.message || "Votação encerrada.");
    },
    onError: (error: IApiError) => {
      toast.error(error.message || "Erro ao fechar votação.");
    },
  });

  const { mutate: cancelMutate, isPending: isCancelling } = useMutation({
    mutationFn: () => cancelReadingDraw(readingDraw.id),
    onSuccess: (result) => {
      invalidateRoom(result.readingDraw);
      setCancelOpen(false);
      toast.success(result.message || "Sorteio cancelado.");
    },
    onError: (error: IApiError) => {
      toast.error(error.message || "Erro ao cancelar.");
    },
  });

  const isBusy =
    isRevealing ||
    isEliminating ||
    isOpeningVote ||
    isClosingVote ||
    isCancelling ||
    actionLocked;

  const runPrimaryAction = () => {
    if (isVote) {
      openVoteMutate();
      return;
    }
    if (isLastStanding) {
      eliminateMutate();
      return;
    }
    revealMutate();
  };

  const handlePrimaryClick = () => {
    if (isVote) {
      if (voteOpened) {
        if (!canCloseVote) {
          toast.error("É preciso pelo menos um voto para fechar.");
          return;
        }
        closeVoteMutate();
        return;
      }
      if (!canStart) {
        toast.error("É preciso pelo menos 2 indicações confirmadas.");
        return;
      }
      if (!allReady) {
        setContinueOpen(true);
        return;
      }
      openVoteMutate();
      return;
    }

    if (isLastStanding) {
      if (!canEliminate) {
        toast.error("É preciso pelo menos 2 indicações restantes.");
        return;
      }
      if (!eliminationsStarted && !allReady) {
        setContinueOpen(true);
        return;
      }
      eliminateMutate();
      return;
    }

    if (!canStart) {
      toast.error("É preciso pelo menos 2 indicações confirmadas.");
      return;
    }
    if (!allReady) {
      setContinueOpen(true);
      return;
    }
    revealMutate();
  };

  const pendingDisplayNames = pendingParticipants.map(
    (participant) =>
      participant.user.nickname || participant.user.name || "alguém",
  );
  const pendingCount = pendingDisplayNames.length;
  const pendingIsSingular = pendingCount === 1;
  const pendingSingleName = pendingDisplayNames[0] ?? "essa pessoa";
  const pendingNamesLabel = pendingDisplayNames.join(", ");

  const continueTitle = pendingIsSingular
    ? `Continuar sem ${pendingSingleName}?`
    : "Continuar sem quem ainda falta?";
  const continueActionLabel = pendingIsSingular
    ? `Continuar sem ${pendingSingleName}`
    : "Continuar sem eles";

  const poolActionLabel = isVote
    ? "A votação"
    : isLastStanding
      ? "A eliminação"
      : "O sorteio";

  let primaryLabel = "Iniciar sorteio";
  if (isVote) {
    if (voteOpened) {
      primaryLabel = isClosingVote ? "Fechando…" : "Fechar votação";
    } else {
      primaryLabel = isOpeningVote ? "Abrindo…" : "Abrir votação";
    }
  } else if (isLastStanding) {
    primaryLabel = isEliminating
      ? "Eliminando…"
      : eliminationsStarted
        ? "Eliminar próximo"
        : "Eliminar um livro";
  } else if (isRevealing) {
    primaryLabel = "Sorteando…";
  }

  let primaryDisabled = isBusy;
  if (isVote) {
    primaryDisabled = voteOpened
      ? isBusy || !canCloseVote
      : isBusy || !canStart;
  } else if (isLastStanding) {
    primaryDisabled = isBusy || !canEliminate;
  } else {
    primaryDisabled = isBusy || !canStart;
  }

  return (
    <div className="space-y-3 rounded-lg border border-primary/40 bg-background p-4">
      <p className="text-sm font-medium text-primary">Painel do anfitrião</p>
      {isVote && voteOpened ? (
        <p className="text-sm text-warm-brown">
          Rodada {readingDraw.voteRound}: {readingDraw.votersWhoVotedCount ?? 0}{" "}
          de {readingDraw.participants.length} já votaram. Contagens ficam
          ocultas até fechar.
        </p>
      ) : isLastStanding && eliminationsStarted ? (
        <p className="text-sm text-warm-brown">
          Restam {standingCount}{" "}
          {standingCount === 1 ? "livro" : "livros"} na prateleira.
        </p>
      ) : allReady ? (
        <p className="text-sm text-warm-brown">
          Todos prontos —{" "}
          {isVote
            ? "pode abrir a votação."
            : isLastStanding
              ? "pode começar a eliminar."
              : "pode sortear."}
        </p>
      ) : (
        <p className="text-sm text-warm-brown">
          Aguardando: {pendingNamesLabel || "confirmações"}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={primaryDisabled}
          onClick={handlePrimaryClick}
        >
          {primaryLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isBusy}
          onClick={() => setCancelOpen(true)}
        >
          Cancelar sorteio
        </Button>
      </div>
      {isVote && !voteOpened && !canStart ? (
        <p className="text-xs text-muted-foreground">
          Mínimo de 2 indicações confirmadas para abrir a votação.
        </p>
      ) : null}
      {isVote && voteOpened && !canCloseVote ? (
        <p className="text-xs text-muted-foreground">
          Aguarde pelo menos um voto antes de fechar.
        </p>
      ) : null}
      {isLastStanding && !canEliminate ? (
        <p className="text-xs text-muted-foreground">
          Mínimo de 2 indicações restantes para eliminar.
        </p>
      ) : null}
      {!isLastStanding && !isVote && !canStart ? (
        <p className="text-xs text-muted-foreground">
          Mínimo de 2 indicações confirmadas para iniciar.
        </p>
      ) : null}

      <AlertDialog open={continueOpen} onOpenChange={setContinueOpen}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader className="gap-3">
            <AlertDialogTitle>{continueTitle}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-left text-sm text-muted-foreground">
                <div className="space-y-2">
                  <p>
                    {pendingIsSingular
                      ? "Ainda não confirmou:"
                      : "Ainda não confirmaram:"}
                  </p>
                  <ul className="flex flex-wrap gap-1.5">
                    {pendingParticipants.map((participant) => {
                      const name =
                        participant.user.nickname ||
                        participant.user.name ||
                        "alguém";
                      return (
                        <li
                          key={participant.id}
                          className="rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-sm font-medium text-foreground"
                        >
                          {name}
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <p className="rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-foreground/90">
                  {poolActionLabel} usa só as{" "}
                  <span className="font-semibold text-foreground">
                    {confirmedCount}{" "}
                    {confirmedCount === 1
                      ? "indicação já confirmada"
                      : "indicações já confirmadas"}
                  </span>
                  .
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                runPrimaryAction();
              }}
            >
              {continueActionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar este sorteio?</AlertDialogTitle>
            <AlertDialogDescription>
              A sessão será encerrada e o clube poderá criar outro sorteio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Manter</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                cancelMutate();
              }}
            >
              Cancelar sorteio
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
