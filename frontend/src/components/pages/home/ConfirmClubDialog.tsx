import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { useAuth } from "../../../contexts/AuthContext";
import { useClub } from "../../../contexts/ClubContext";
import type { IApiError } from "../../../types/IApi";
import { Loader2 } from "lucide-react";
import { fetchClubByInvitationCode } from "../../../api/queries/fetchClubs";
import type { IClubWithOwner } from "../../../types/IClubs";
import { joinClub } from "../../../api/mutations/clubMutate";
import type { IMembersPayload } from "../../../types/IMember";
import type { AxiosError } from "axios";

interface JoinClubDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invitationCode: string;
  onSuccess: () => void;
}

const JoinClubDialog = ({
  open,
  onOpenChange,
  invitationCode,
  onSuccess,
}: JoinClubDialogProps) => {
  const { user } = useAuth();
  const { setSelectedClubId } = useClub();
  const queryClient = useQueryClient();

  const {
    data: club,
    isLoading: isQueryLoading,
    isError: isQueryError,
    error: queryError,
  } = useQuery<IClubWithOwner, AxiosError<IApiError>>({
    queryKey: ["clubByCode", invitationCode],
    queryFn: () => fetchClubByInvitationCode(invitationCode),
    enabled: open && !!invitationCode,
    retry: false,
  });

  const { mutate: joinClubMutate, isPending: isMutationPending } = useMutation<
    any,
    IApiError,
    IMembersPayload
  >({
    mutationFn: joinClub,
    onSuccess: async (result) => {
      queryClient.invalidateQueries({ queryKey: ["userClubs", user?.id] });
      onOpenChange(false);
      onSuccess();
      setSelectedClubId(result.member.club_id);
      toast.success(`Você entrou no clube ${result.member.club.name}!`);
    },
    onError: (error) => {
      toast.error(error.message || "Não foi possível entrar no clube.");
    },
  });

  const handleConfirmJoin = () => {
    if (!club || !user?.id) return;

    const payload: IMembersPayload = {
      clubId: club.id,
      userId: user.id,
    };

    joinClubMutate(payload);
  };

  const renderContent = () => {
    if (isQueryLoading) {
      return (
        <DialogDescription className="flex items-center justify-center gap-2 py-8 text-warm-brown">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Buscando clube pelo código...</span>
        </DialogDescription>
      );
    }

    if (isQueryError) {
      const errorMessage =
        queryError?.response?.data?.message || "Erro ao buscar clube.";

      return (
        <DialogDescription className="py-4 flex items-center">
          <span className="text-lg text-primary font-semibold text-center">
            {errorMessage}
          </span>
        </DialogDescription>
      );
    }

    if (club) {
      return (
        <>
          <DialogDescription className="text-1xl text-warm-brown">
            Você confirma que deseja entrar no clube abaixo?
          </DialogDescription>
          <div className="my-4 rounded-lg border-2 border-secondary bg-background p-4">
            <h4 className="text-xl text-center font-semibold text-foreground">
              {club.name}
            </h4>

            <p className="mt-1 text-center text-warm-brown mb-2">
              {club.description}
            </p>
            <hr></hr>
            <p className="mt-1 text-center text-warm-brown">
              Criado por: {club.user.name}
            </p>
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] gap-2">
        <DialogHeader className="gap-0">
          <DialogTitle className="text-3xl text-primary">
            Entrar em um Clube
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-[150px] flex items-center justify-center">
          {renderContent()}
        </div>

        <DialogFooter className="mt-5">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isMutationPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirmJoin}
            disabled={isMutationPending || isQueryLoading || !club}
          >
            {isMutationPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Confirmar e Entrar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JoinClubDialog;
