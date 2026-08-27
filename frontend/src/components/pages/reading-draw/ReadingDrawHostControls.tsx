import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  cancelReadingDraw,
  eliminateReadingDrawNomination,
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

  const isBusy = isRevealing || isEliminating || isCancelling || actionLocked;

  const runPrimaryAction = () => {
    if (isLastStanding) {
      eliminateMutate();
      return;
    }
    revealMutate();
  };

  const handlePrimaryClick = () => {
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

  const pendingNames = pendingParticipants
    .map(
      (participant) =>
        participant.user.nickname || participant.user.name || "alguém",
    )
    .join(", ");

  const primaryLabel = isLastStanding
    ? isEliminating
      ? "Eliminando…"
      : eliminationsStarted
        ? "Eliminar próximo"
        : "Eliminar um livro"
    : isRevealing
      ? "Sorteando…"
      : "Iniciar sorteio";

  const primaryDisabled = isLastStanding
    ? isBusy || !canEliminate
    : isBusy || !canStart;

  return (
    <div className="space-y-3 rounded-lg border border-primary/40 bg-background p-4">
      <p className="text-sm font-medium text-primary">Painel do anfitrião</p>
      {isLastStanding && eliminationsStarted ? (
        <p className="text-sm text-warm-brown">
          Restam {standingCount}{" "}
          {standingCount === 1 ? "livro" : "livros"} na prateleira.
        </p>
      ) : allReady ? (
        <p className="text-sm text-warm-brown">
          Todos prontos —{" "}
          {isLastStanding ? "pode começar a eliminar." : "pode sortear."}
        </p>
      ) : (
        <p className="text-sm text-warm-brown">
          Aguardando: {pendingNames || "confirmações"}
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
      {isLastStanding && !canEliminate ? (
        <p className="text-xs text-muted-foreground">
          Mínimo de 2 indicações restantes para eliminar.
        </p>
      ) : null}
      {!isLastStanding && !canStart ? (
        <p className="text-xs text-muted-foreground">
          Mínimo de 2 indicações confirmadas para iniciar.
        </p>
      ) : null}

      <AlertDialog open={continueOpen} onOpenChange={setContinueOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Continuar sem todo mundo?</AlertDialogTitle>
            <AlertDialogDescription>
              Ainda não confirmaram: {pendingNames}.{" "}
              {isLastStanding
                ? `A eliminação usa só as indicações já confirmadas (${confirmedCount}).`
                : `O sorteio usa só as indicações já confirmadas (${confirmedCount}).`}
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
              Continuar sem eles
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
