import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Link } from "react-router";
import { Loader2 } from "lucide-react";
import type { AxiosError } from "axios";
import { Button } from "../../ui/button";
import { useAuth } from "../../../contexts/AuthContext";
import { useClub } from "../../../contexts/ClubContext";
import type { IApiError } from "../../../types/IApi";
import type { IClubInvitePreview } from "../../../types/IClubs";
import type { IMembersPayload } from "../../../types/IMember";
import { fetchClubByInvitationCode } from "../../../api/queries/fetchClubs";
import { joinClub } from "../../../api/mutations/clubMutate";
import { redirectSearch } from "../../../utils/safeRedirect";

type JoinClubPanelProps = {
  invitationCode: string;
  enabled?: boolean;
  variant: "dialog" | "page";
  onCancel?: () => void;
  onJoined?: (clubId: string) => void;
};

export default function JoinClubPanel({
  invitationCode,
  enabled = true,
  variant,
  onCancel,
  onJoined,
}: JoinClubPanelProps) {
  const { user, isLoggedIn } = useAuth();
  const { clubs, setSelectedClubId, isLoadingClubs } = useClub();
  const queryClient = useQueryClient();

  const {
    data: club,
    isLoading: isQueryLoading,
    isError: isQueryError,
    error: queryError,
  } = useQuery<IClubInvitePreview, AxiosError<IApiError>>({
    queryKey: ["clubByCode", invitationCode],
    queryFn: () => fetchClubByInvitationCode(invitationCode),
    enabled: enabled && !!invitationCode,
    retry: false,
  });

  const isAlreadyMember =
    !!club && isLoggedIn && clubs.some((userClub) => userClub.id === club.id);

  const { mutate: joinClubMutate, isPending: isMutationPending } = useMutation<
    { member: { club: { name: string } | null } },
    IApiError,
    IMembersPayload
  >({
    mutationFn: joinClub,
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["userClubs", user?.id] });
      if (club) {
        setSelectedClubId(club.id);
        onJoined?.(club.id);
      }
      toast.success(
        `Você entrou no clube ${result.member.club?.name ?? club?.name}!`
      );
    },
    onError: (error) => {
      toast.error(error.message || "Não foi possível entrar no clube.");
    },
  });

  const handleConfirmJoin = () => {
    if (!club || !user?.id) return;
    joinClubMutate({
      clubId: club.id,
      userId: user.id,
    });
  };

  const handleGoToClub = () => {
    if (!club) return;
    setSelectedClubId(club.id);
    onJoined?.(club.id);
  };

  const inviteRedirectPath = `/convite/${invitationCode}`;

  const renderBody = () => {
    if (isQueryLoading || (isLoggedIn && isLoadingClubs && !!club)) {
      return (
        <div className="flex items-center justify-center gap-2 py-8 text-warm-brown">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Buscando clube pelo código...</span>
        </div>
      );
    }

    if (isQueryError) {
      const errorMessage =
        queryError?.response?.data?.message || "Erro ao buscar clube.";

      return (
        <div className="flex items-center justify-center py-4">
          <span className="text-center text-lg font-semibold text-primary">
            {errorMessage}
          </span>
        </div>
      );
    }

    if (!club) return null;

    return (
      <>
        {variant === "page" && !isLoggedIn ? (
          <p className="text-center text-warm-brown">
            Você foi convidado(a) para o clube abaixo.
          </p>
        ) : isAlreadyMember ? (
          <p className="text-center text-warm-brown">
            Você já faz parte deste clube.
          </p>
        ) : (
          <p className="text-center text-warm-brown">
            Você confirma que deseja entrar no clube abaixo?
          </p>
        )}
        <div className="my-4 rounded-lg border-2 border-secondary bg-background p-4">
          <h4 className="text-center text-xl font-semibold text-foreground">
            {club.name}
          </h4>
          <p className="mb-2 mt-1 text-center text-warm-brown">
            {club.description}
          </p>
          <hr />
          <p className="mt-1 text-center text-warm-brown">
            Criado por: {club.user?.name ?? "—"}
          </p>
        </div>
      </>
    );
  };

  const renderActions = () => {
    if (isQueryError || isQueryLoading || !club) {
      if (variant === "dialog") {
        return (
          <Button type="button" variant="outline" onClick={onCancel}>
            Fechar
          </Button>
        );
      }
      return null;
    }

    if (!isLoggedIn && variant === "page") {
      return (
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="w-full sm:w-auto">
            <Link to={`/register${redirectSearch(inviteRedirectPath)}`}>
              Criar conta
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link to={`/login${redirectSearch(inviteRedirectPath)}`}>
              Já tenho conta
            </Link>
          </Button>
        </div>
      );
    }

    if (isAlreadyMember) {
      return (
        <div
          className={
            variant === "page"
              ? "flex w-full flex-col items-center gap-3"
              : "flex w-full flex-col gap-3 sm:flex-row sm:justify-end"
          }
        >
          {variant === "dialog" ? (
            <Button type="button" variant="outline" onClick={onCancel}>
              Fechar
            </Button>
          ) : null}
          <Button type="button" onClick={handleGoToClub}>
            Ir para o clube
          </Button>
        </div>
      );
    }

    if (!isLoggedIn) {
      return null;
    }

    return (
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isMutationPending}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={handleConfirmJoin}
          disabled={isMutationPending}
        >
          {isMutationPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Confirmar e Entrar"
          )}
        </Button>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex min-h-[150px] flex-col justify-center gap-4">
        {renderBody()}
      </div>
      <div className={variant === "dialog" ? "mt-5" : "mt-2"}>
        {renderActions()}
      </div>
    </div>
  );
}
