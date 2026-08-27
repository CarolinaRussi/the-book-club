import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  confirmReadingDrawNomination,
  unconfirmReadingDrawNomination,
  upsertReadingDrawNomination,
} from "@/api/mutations/readingDrawMutate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { IApiError } from "@/types/IApi";
import type { IReadingDraw } from "@/types/IReadingDraw";

type ReadingDrawNominationFormProps = {
  readingDraw: IReadingDraw;
  shareCode: string;
  userId: string;
};

export default function ReadingDrawNominationForm({
  readingDraw,
  shareCode,
  userId,
}: ReadingDrawNominationFormProps) {
  const queryClient = useQueryClient();
  const myNomination = readingDraw.nominations.find(
    (nomination) => nomination.userId === userId,
  );
  const isConfirmed = Boolean(myNomination?.confirmedAt);
  const eliminationsStarted = readingDraw.nominations.some(
    (nomination) => nomination.eliminatedAt,
  );

  const [title, setTitle] = useState(myNomination?.title ?? "");
  const [author, setAuthor] = useState(myNomination?.author ?? "");

  useEffect(() => {
    setTitle(myNomination?.title ?? "");
    setAuthor(myNomination?.author ?? "");
  }, [myNomination?.title, myNomination?.author, myNomination?.confirmedAt]);

  const invalidateRoom = (next: IReadingDraw) => {
    queryClient.setQueryData(["readingDraw", shareCode], {
      readingDraw: next,
    });
    queryClient.invalidateQueries({
      queryKey: ["activeReadingDraw", readingDraw.clubId],
    });
  };

  const { mutate: saveMutate, isPending: isSaving } = useMutation({
    mutationFn: () =>
      upsertReadingDrawNomination(readingDraw.id, {
        title: title.trim(),
        author: author.trim() || undefined,
      }),
    onSuccess: (result) => {
      invalidateRoom(result.readingDraw);
      toast.success(result.message || "Indicação salva.");
    },
    onError: (error: IApiError) => {
      toast.error(error.message || "Erro ao salvar indicação.");
    },
  });

  const { mutate: confirmMutate, isPending: isConfirming } = useMutation({
    mutationFn: async () => {
      if (!myNomination || myNomination.title !== title.trim()) {
        await upsertReadingDrawNomination(readingDraw.id, {
          title: title.trim(),
          author: author.trim() || undefined,
        });
      }
      return confirmReadingDrawNomination(readingDraw.id);
    },
    onSuccess: (result) => {
      invalidateRoom(result.readingDraw);
      toast.success(result.message || "Indicação confirmada.");
    },
    onError: (error: IApiError) => {
      toast.error(error.message || "Erro ao confirmar.");
    },
  });

  const { mutate: unconfirmMutate, isPending: isUnconfirming } = useMutation({
    mutationFn: () => unconfirmReadingDrawNomination(readingDraw.id),
    onSuccess: (result) => {
      invalidateRoom(result.readingDraw);
      toast.success(result.message || "Pode alterar a indicação.");
    },
    onError: (error: IApiError) => {
      toast.error(error.message || "Erro ao alterar.");
    },
  });

  const isPending = isSaving || isConfirming || isUnconfirming;

  if (eliminationsStarted) {
    return (
      <div className="space-y-3 rounded-lg border border-muted bg-muted/30 p-4">
        <p className="text-sm font-medium text-primary">Sua indicação</p>
        {myNomination?.title ? (
          <>
            <p className="text-lg font-semibold text-foreground">
              {myNomination.title}
            </p>
            {myNomination.author ? (
              <p className="text-sm text-warm-brown">{myNomination.author}</p>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Sem indicação nesta rodada.</p>
        )}
        <p className="text-xs text-muted-foreground">
          A eliminação já começou — indicações travadas.
        </p>
      </div>
    );
  }

  if (isConfirmed) {
    return (
      <div className="space-y-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
        <p className="text-sm font-medium text-primary">Sua indicação</p>
        <p className="text-lg font-semibold text-foreground">
          {myNomination?.title}
        </p>
        {myNomination?.author ? (
          <p className="text-sm text-warm-brown">{myNomination.author}</p>
        ) : null}
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => unconfirmMutate()}
        >
          Alterar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border border-secondary/40 bg-background p-4">
      <p className="text-sm font-medium text-primary">Indicar um livro</p>
      <div className="space-y-2">
        <Label htmlFor="draw-nomination-title">Título</Label>
        <Input
          id="draw-nomination-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Nome do livro"
          maxLength={255}
          disabled={isPending}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="draw-nomination-author">Autor (opcional)</Label>
        <Input
          id="draw-nomination-author"
          value={author}
          onChange={(event) => setAuthor(event.target.value)}
          placeholder="Nome do autor"
          maxLength={255}
          disabled={isPending}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={isPending || !title.trim()}
          onClick={() => saveMutate()}
        >
          Salvar
        </Button>
        <Button
          type="button"
          disabled={isPending || !title.trim()}
          onClick={() => confirmMutate()}
        >
          Confirmar escolha
        </Button>
      </div>
    </div>
  );
}
