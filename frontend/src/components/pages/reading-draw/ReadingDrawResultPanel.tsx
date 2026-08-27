import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { cancelReadingDraw } from "@/api/mutations/readingDrawMutate";
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

type ReadingDrawResultPanelProps = {
  readingDraw: IReadingDraw;
  shareCode: string;
  isHost: boolean;
};

export default function ReadingDrawResultPanel({
  readingDraw,
  shareCode,
  isHost,
}: ReadingDrawResultPanelProps) {
  const queryClient = useQueryClient();
  const [cancelOpen, setCancelOpen] = useState(false);

  const winner = readingDraw.nominations.find(
    (nomination) => nomination.id === readingDraw.winnerNominationId,
  );
  const winnerParticipant = readingDraw.participants.find(
    (participant) => participant.userId === winner?.userId,
  );
  const winnerName =
    winnerParticipant?.user.nickname ||
    winnerParticipant?.user.name ||
    "alguém";

  const { mutate: cancelMutate, isPending: isCancelling } = useMutation({
    mutationFn: () => cancelReadingDraw(readingDraw.id),
    onSuccess: (result) => {
      queryClient.setQueryData(["readingDraw", shareCode], {
        readingDraw: result.readingDraw,
      });
      queryClient.invalidateQueries({
        queryKey: ["activeReadingDraw", readingDraw.clubId],
      });
      setCancelOpen(false);
      toast.success(result.message || "Sorteio cancelado.");
    },
    onError: (error: IApiError) => {
      toast.error(error.message || "Erro ao cancelar.");
    },
  });

  return (
    <div className="space-y-3 rounded-lg border border-primary bg-primary/5 p-4">
      <p className="text-sm font-medium text-primary">Livro sorteado</p>
      {winner ? (
        <>
          <p className="text-2xl font-bold text-foreground">{winner.title}</p>
          {winner.author ? (
            <p className="text-warm-brown">{winner.author}</p>
          ) : null}
          <p className="text-sm text-muted-foreground">
            Indicado por {winnerName}
          </p>
        </>
      ) : (
        <p className="text-warm-brown">Resultado indisponível.</p>
      )}
      {isHost ? (
        <div className="flex flex-wrap gap-2">
          <Button type="button" disabled title="Disponível na próxima parte">
            Adicionar livro à biblioteca
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isCancelling}
            onClick={() => setCancelOpen(true)}
          >
            Cancelar sorteio
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          O anfitrião vai cadastrar o livro na biblioteca do clube.
        </p>
      )}

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar este sorteio?</AlertDialogTitle>
            <AlertDialogDescription>
              O resultado será descartado e o clube poderá criar outro sorteio.
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
