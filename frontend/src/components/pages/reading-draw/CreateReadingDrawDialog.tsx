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
import type { IApiError } from "@/types/IApi";
import type { IReadingDraw } from "@/types/IReadingDraw";

type CreateReadingDrawDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

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

  const { data: membersData, isLoading: isLoadingMembers } = useQuery({
    queryKey: ["readers", selectedClubId, "reading-draw-create"],
    queryFn: () => fetchReadersByClubId(selectedClubId, 1, 100),
    enabled: open && !!selectedClubId,
  });

  const members = membersData?.data ?? [];

  useEffect(() => {
    if (!open) return;
    setDeadlineLocal(defaultDeadlineValue());
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
    { participantUserIds: string[]; deadlineAt: string }
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
    });
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>
              Sortear próxima leitura
            </ResponsiveDialogTitle>
          </ResponsiveDialogHeader>

          <ResponsiveDialogBody className="space-y-5">
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
              <div className="flex items-center justify-between gap-2">
                <Label>Participantes</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={isLoadingMembers || members.length === 0}
                >
                  {allSelected ? "Limpar" : "Todos"}
                </Button>
              </div>
              {isLoadingMembers ? (
                <p className="text-sm text-muted-foreground">
                  Carregando membros…
                </p>
              ) : (
                <ul className="max-h-56 space-y-2 overflow-y-auto rounded-md border border-muted p-2">
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
              <p className="text-xs text-muted-foreground">
                Você inicia o sorteio. Pode tirar-se da lista e só conduzir.
              </p>
            </div>
          </ResponsiveDialogBody>

          <ResponsiveDialogFooter>
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
