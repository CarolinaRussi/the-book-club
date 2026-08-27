import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  cancelReadingDraw,
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

type ReadingDrawHostControlsProps = {
  readingDraw: IReadingDraw;
  shareCode: string;
};

export default function ReadingDrawHostControls({
  readingDraw,
  shareCode,
}: ReadingDrawHostControlsProps) {
  const queryClient = useQueryClient();
  const [continueOpen, setContinueOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const pendingParticipants = readingDraw.participants.filter((participant) => {
    const nomination = readingDraw.nominations.find(
      (item) => item.userId === participant.userId,
    );
    return !nomination?.confirmedAt;
  });

  const confirmedCount = readingDraw.nominations.filter(
    (nomination) => nomination.confirmedAt,
  ).length;
  const allReady = pendingParticipants.length === 0;
  const canReveal = confirmedCount >= 2;

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

  const handleRevealClick = () => {
    if (!canReveal) {
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

  return (
    <div className="space-y-3 rounded-lg border border-primary/40 bg-background p-4">
      <p className="text-sm font-medium text-primary">Painel do anfitrião</p>
      {allReady ? (
        <p className="text-sm text-warm-brown">Todos prontos — pode sortear.</p>
      ) : (
        <p className="text-sm text-warm-brown">
          Aguardando: {pendingNames || "confirmações"}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={isRevealing || isCancelling || !canReveal}
          onClick={handleRevealClick}
        >
          {isRevealing ? "Sorteando…" : "Iniciar sorteio"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isRevealing || isCancelling}
          onClick={() => setCancelOpen(true)}
        >
          Cancelar sorteio
        </Button>
      </div>
      {!canReveal ? (
        <p className="text-xs text-muted-foreground">
          Mínimo de 2 indicações confirmadas para iniciar.
        </p>
      ) : null}

      <AlertDialog open={continueOpen} onOpenChange={setContinueOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Continuar sem todo mundo?</AlertDialogTitle>
            <AlertDialogDescription>
              Ainda não confirmaram: {pendingNames}. O sorteio usa só as
              indicações já confirmadas ({confirmedCount}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                revealMutate();
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
