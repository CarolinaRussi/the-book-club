import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { createReadingDraw } from "@/api/mutations/readingDrawMutate";
import { fetchReadersByClubId } from "@/api/queries/fetchReaders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useClub } from "@/contexts/ClubContext";
import { cn } from "@/lib/utils";
import type { IApiError } from "@/types/IApi";
import type {
  IReadingDraw,
  ReadingDrawCreateMode,
} from "@/types/IReadingDraw";
import {
  READING_DRAW_MODE_DIRECT,
  READING_DRAW_MODE_LAST_STANDING,
  READING_DRAW_MODE_VOTE,
  READING_DRAW_MULTI_VOTE_OPTIONS,
  readingDrawModeLabels,
} from "@/utils/constants/readingDraw";

type CreateReadingDrawDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const CREATE_MODES: ReadingDrawCreateMode[] = [
  READING_DRAW_MODE_DIRECT,
  READING_DRAW_MODE_LAST_STANDING,
  READING_DRAW_MODE_VOTE,
];

function toDatetimeLocalValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function defaultDeadlineValue(): string {
  return toDatetimeLocalValue(new Date(Date.now() + 4 * 60 * 60 * 1000));
}

export default function CreateReadingDrawDialog({
  open,
  onOpenChange,
}: CreateReadingDrawDialogProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { selectedClubId } = useClub();
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [deadlineLocal, setDeadlineLocal] = useState(defaultDeadlineValue);
  const [mode, setMode] = useState<ReadingDrawCreateMode>(
    READING_DRAW_MODE_DIRECT,
  );
  const [voteStyle, setVoteStyle] = useState<"single" | "multi">("multi");
  const [multiVotes, setMultiVotes] = useState<number>(3);

  const { data: membersData, isLoading: isLoadingMembers } = useQuery({
    queryKey: ["readers", selectedClubId, "reading-draw-create"],
    queryFn: () => fetchReadersByClubId(selectedClubId, 1, 100),
    enabled: open && !!selectedClubId,
  });

  const members = membersData?.data ?? [];

  useEffect(() => {
    if (!open) return;
    setDeadlineLocal(defaultDeadlineValue());
    setMode(READING_DRAW_MODE_DIRECT);
    setVoteStyle("multi");
    setMultiVotes(3);
    if (members.length > 0) {
      setSelectedUserIds(members.map((member) => member.user.id));
    }
  }, [open, members]);

  const allSelected = useMemo(
    () =>
      members.length > 0 &&
      members.every((member) => selectedUserIds.includes(member.user.id)),
    [members, selectedUserIds],
  );

  const { mutate: createMutate, isPending } = useMutation<
    { message: string; readingDraw: IReadingDraw },
    IApiError,
    {
      participantUserIds: string[];
      deadlineAt: string;
      mode: ReadingDrawCreateMode;
      voteVotesPerParticipant?: number;
    }
  >({
    mutationFn: (payload) => createReadingDraw(selectedClubId!, payload),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({
        queryKey: ["activeReadingDraw", selectedClubId],
      });
      toast.success(result.message || "Sorteio criado!");
      onOpenChange(false);
      navigate(`/sorteio/${result.readingDraw.shareCode}`);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar sorteio.");
    },
  });

  const toggleUser = (userId: string) => {
    setSelectedUserIds((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId],
    );
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedUserIds([]);
      return;
    }
    setSelectedUserIds(members.map((member) => member.user.id));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!selectedClubId) {
      toast.error("Selecione um clube.");
      return;
    }
    if (selectedUserIds.length < 1) {
      toast.error("Escolha pelo menos um participante.");
      return;
    }
    const deadlineAt = new Date(deadlineLocal);
    if (Number.isNaN(deadlineAt.getTime())) {
      toast.error("Data limite inválida.");
      return;
    }
    createMutate({
      participantUserIds: selectedUserIds,
      deadlineAt: deadlineAt.toISOString(),
      mode,
      ...(mode === READING_DRAW_MODE_VOTE
        ? {
            voteVotesPerParticipant:
              voteStyle === "single" ? 1 : multiVotes,
          }
        : {}),
    });
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="w-full sm:max-w-lg lg:flex lg:max-h-[min(90dvh,100svh)] lg:flex-col lg:overflow-hidden">
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden"
        >
          <ResponsiveDialogHeader className="shrink-0 pr-8">
            <ResponsiveDialogTitle>
              Sortear próxima leitura
            </ResponsiveDialogTitle>
          </ResponsiveDialogHeader>

          <ResponsiveDialogBody className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain">
            <div className="space-y-2">
              <Label>Modo</Label>
              <ul className="space-y-2">
                {CREATE_MODES.map((createMode) => {
                  const selected = mode === createMode;
                  const labels = readingDrawModeLabels[createMode];
                  return (
                    <li key={createMode}>
                      <label
                        className={cn(
                          "flex cursor-pointer gap-3 rounded-lg border px-3 py-2.5 transition-colors",
                          selected
                            ? "border-primary bg-primary/5"
                            : "border-muted hover:bg-muted/40",
                        )}
                      >
                        <input
                          type="radio"
                          name="reading-draw-mode"
                          className="mt-1 size-4 accent-primary"
                          checked={selected}
                          onChange={() => setMode(createMode)}
                        />
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-foreground">
                            {labels.title}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {labels.description}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>

            {mode === READING_DRAW_MODE_VOTE ? (
              <div className="space-y-3 rounded-lg border border-muted p-3">
                <Label>Tipo de voto</Label>
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="vote-style"
                      className="size-4 accent-primary"
                      checked={voteStyle === "single"}
                      onChange={() => setVoteStyle("single")}
                    />
                    Voto único
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="vote-style"
                      className="size-4 accent-primary"
                      checked={voteStyle === "multi"}
                      onChange={() => setVoteStyle("multi")}
                    />
                    Múltiplo (até N livros)
                  </label>
                </div>
                {voteStyle === "multi" ? (
                  <div className="space-y-1.5">
                    <Label htmlFor="multi-votes-count">Votos por pessoa</Label>
                    <select
                      id="multi-votes-count"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                      value={multiVotes}
                      onChange={(event) =>
                        setMultiVotes(Number(event.target.value))
                      }
                    >
                      {READING_DRAW_MULTI_VOTE_OPTIONS.map((count) => (
                        <option key={count} value={count}>
                          {count}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="reading-draw-deadline">Prazo máximo</Label>
              <Input
                id="reading-draw-deadline"
                type="datetime-local"
                value={deadlineLocal}
                onChange={(event) => setDeadlineLocal(event.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Padrão: 4 horas. Máximo: 14 dias.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Participantes</Label>
              {isLoadingMembers ? (
                <p className="text-sm text-muted-foreground">
                  Carregando membros…
                </p>
              ) : (
                <ul className="max-h-56 space-y-1 overflow-y-auto rounded-md border border-muted p-2">
                  <li>
                    <label
                      className={`flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted/50 ${
                        members.length === 0
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="size-4 accent-primary"
                        checked={allSelected}
                        disabled={members.length === 0}
                        onChange={handleSelectAll}
                      />
                      <span className="text-sm font-medium">Todos</span>
                    </label>
                  </li>
                  {members.map((member) => {
                    const checked = selectedUserIds.includes(member.user.id);
                    const isCurrentUser = member.user.id === user?.id;
                    return (
                      <li key={member.id}>
                        <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted/50">
                          <input
                            type="checkbox"
                            className="size-4 accent-primary"
                            checked={checked}
                            onChange={() => toggleUser(member.user.id)}
                          />
                          <span className="text-sm">
                            {member.user.nickname || member.user.name}
                            {isCurrentUser ? " (você)" : ""}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
              <p className="mb-2 text-xs text-muted-foreground">
                Você inicia o sorteio. Pode tirar-se da lista e só conduzir.
              </p>
            </div>
          </ResponsiveDialogBody>

          <ResponsiveDialogFooter className="shrink-0 border-t border-border/60 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || isLoadingMembers}>
              {isPending ? "Criando…" : "Criar sorteio"}
            </Button>
          </ResponsiveDialogFooter>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
