import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { castReadingDrawVotes } from "@/api/mutations/readingDrawMutate";
import { Button } from "@/components/ui/button";
import type { IApiError } from "@/types/IApi";
import type { IReadingDraw } from "@/types/IReadingDraw";
import { cn } from "@/lib/utils";

type ReadingDrawVotePanelProps = {
  readingDraw: IReadingDraw;
  shareCode: string;
};

export default function ReadingDrawVotePanel({
  readingDraw,
  shareCode,
}: ReadingDrawVotePanelProps) {
  const queryClient = useQueryClient();
  const votesAllowed = readingDraw.voteVotesPerParticipant ?? 1;
  const eligible = readingDraw.nominations.filter(
    (nomination) => nomination.confirmedAt && !nomination.eliminatedAt,
  );

  const [selectedIds, setSelectedIds] = useState<string[]>(
    readingDraw.myVoteNominationIds ?? [],
  );

  useEffect(() => {
    setSelectedIds(readingDraw.myVoteNominationIds ?? []);
  }, [
    readingDraw.voteRound,
    readingDraw.myVoteNominationIds,
  ]);

  const hasSavedVotes = (readingDraw.myVoteNominationIds ?? []).length > 0;

  const invalidateRoom = (next: IReadingDraw) => {
    queryClient.setQueryData(["readingDraw", shareCode], {
      readingDraw: next,
    });
    queryClient.invalidateQueries({
      queryKey: ["activeReadingDraw", readingDraw.clubId],
    });
  };

  const { mutate: castMutate, isPending } = useMutation({
    mutationFn: () => castReadingDrawVotes(readingDraw.id, selectedIds),
    onSuccess: (result) => {
      invalidateRoom(result.readingDraw);
      toast.success(result.message || "Votos registrados!");
    },
    onError: (error: IApiError) => {
      toast.error(error.message || "Erro ao votar.");
    },
  });

  const toggleNomination = (nominationId: string) => {
    setSelectedIds((current) => {
      if (current.includes(nominationId)) {
        return current.filter((id) => id !== nominationId);
      }
      if (votesAllowed === 1) {
        return [nominationId];
      }
      if (current.length >= votesAllowed) {
        toast.error(`Você pode escolher no máximo ${votesAllowed} livro(s).`);
        return current;
      }
      return [...current, nominationId];
    });
  };

  return (
    <div className="space-y-3 rounded-lg border border-primary/40 bg-background p-4">
      <div className="space-y-1">
        <p className="text-sm font-medium text-primary">
          Sua votação
          {readingDraw.voteRound != null && readingDraw.voteRound > 1
            ? ` · rodada ${readingDraw.voteRound}`
            : ""}
        </p>
        <p className="text-xs text-muted-foreground">
          {votesAllowed === 1
            ? "Escolha 1 livro."
            : `Escolha até ${votesAllowed} livros (no máximo 1 voto por livro).`}
          {" "}
          Pode votar no seu.
        </p>
        <p className="text-xs text-warm-brown">
          Já votaram: {readingDraw.votersWhoVotedCount ?? 0} de{" "}
          {readingDraw.participants.length}
        </p>
      </div>

      <ul className="space-y-2">
        {eligible.map((nomination) => {
          const checked = selectedIds.includes(nomination.id);
          return (
            <li key={nomination.id}>
              <label
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2 transition-colors",
                  checked
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:bg-muted/40",
                )}
              >
                <input
                  type={votesAllowed === 1 ? "radio" : "checkbox"}
                  name="reading-draw-vote"
                  className="mt-1 size-4 accent-primary"
                  checked={checked}
                  onChange={() => toggleNomination(nomination.id)}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium">
                    {nomination.title}
                  </span>
                  {nomination.author ? (
                    <span className="block text-xs text-muted-foreground">
                      {nomination.author}
                    </span>
                  ) : null}
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          disabled={isPending || selectedIds.length < 1}
          onClick={() => castMutate()}
        >
          {isPending
            ? "Enviando…"
            : hasSavedVotes
              ? "Atualizar votos"
              : "Enviar votos"}
        </Button>
        {hasSavedVotes ? (
          <span className="text-xs text-primary">Seus votos estão salvos.</span>
        ) : null}
      </div>
    </div>
  );
}
