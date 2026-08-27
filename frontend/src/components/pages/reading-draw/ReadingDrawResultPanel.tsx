import { useState } from "react";
import { Link } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  cancelReadingDraw,
  completeReadingDraw,
} from "@/api/mutations/readingDrawMutate";
import CreateBookDialog from "@/components/pages/library/CreateBookDialog";
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
import { READING_DRAW_STATUS_COMPLETED } from "@/utils/constants/readingDraw";

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
  const [addBookOpen, setAddBookOpen] = useState(false);

  const isCompleted = readingDraw.status === READING_DRAW_STATUS_COMPLETED;

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

  const invalidateRoom = (next: IReadingDraw) => {
    queryClient.setQueryData(["readingDraw", shareCode], {
      readingDraw: next,
    });
    queryClient.invalidateQueries({
      queryKey: ["activeReadingDraw", readingDraw.clubId],
    });
  };

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

  const handleBookCreated = async (clubBookId: string) => {
    try {
      const result = await completeReadingDraw(readingDraw.id, clubBookId);
      invalidateRoom(result.readingDraw);
      toast.success("Livro adicionado e sorteio concluído!");
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String((error as IApiError).message)
          : "Livro criado, mas falhou ao concluir o sorteio.";
      toast.error(message);
      throw error;
    }
  };

  if (isCompleted) {
    return (
      <div className="space-y-4 rounded-lg border border-primary bg-primary/5 p-4">
        <p className="text-sm font-medium text-primary">Sorteio concluído</p>
        {winner ? (
          <>
            <p className="text-2xl font-bold text-foreground">{winner.title}</p>
            {winner.author ? (
              <p className="text-warm-brown">{winner.author}</p>
            ) : null}
          </>
        ) : null}
        <p className="text-sm text-warm-brown">
          O livro já está na biblioteca do clube como sugerido.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" asChild>
            <Link to="/library">Ver biblioteca</Link>
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link to="/meetings">Agendar encontro</Link>
          </Button>
        </div>
      </div>
    );
  }

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
          <Button type="button" onClick={() => setAddBookOpen(true)}>
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

      <CreateBookDialog
        open={addBookOpen}
        onOpenChange={setAddBookOpen}
        initialTitle={winner?.title ?? ""}
        initialAuthor={winner?.author ?? ""}
        dialogTitle="Cadastrar livro sorteado"
        onBookCreated={handleBookCreated}
      />

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
