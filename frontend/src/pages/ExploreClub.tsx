import { Link, useNavigate, useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { fetchPublicClubPreview } from "@/api/queries/fetchDiscoverClubs";
import {
  createJoinRequest,
  joinPublicClub,
} from "@/api/mutations/clubMutate";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useClub } from "@/contexts/ClubContext";
import type { IApiError } from "@/types/IApi";
import {
  CLUB_JOIN_POLICY_OPEN,
  clubJoinPolicyLabels,
  meetingFormatLabels,
} from "@/utils/constants/clubs";

export default function ExploreClub() {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { setSelectedClubId } = useClub();

  const { data: club, isLoading, isError } = useQuery({
    queryKey: ["publicClubPreview", clubId],
    queryFn: () => fetchPublicClubPreview(clubId as string),
    enabled: !!clubId,
  });

  const invalidateExplore = async () => {
    await queryClient.invalidateQueries({ queryKey: ["publicClubPreview", clubId] });
    await queryClient.invalidateQueries({ queryKey: ["discoverClubs"] });
    await queryClient.invalidateQueries({ queryKey: ["userClubs", user?.id] });
  };

  const { mutate: joinMutate, isPending: isJoining } = useMutation<
    unknown,
    IApiError,
    string
  >({
    mutationFn: joinPublicClub,
    onSuccess: async () => {
      toast.success("Você entrou no clube!");
      await invalidateExplore();
      if (clubId) {
        setSelectedClubId(clubId);
        navigate("/home");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao entrar no clube");
    },
  });

  const { mutate: requestMutate, isPending: isRequesting } = useMutation<
    unknown,
    IApiError,
    string
  >({
    mutationFn: createJoinRequest,
    onSuccess: async () => {
      toast.success("Pedido de entrada enviado");
      await invalidateExplore();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar pedido");
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 text-muted-foreground">
        Carregando clube…
      </div>
    );
  }

  if (isError || !club) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-10">
        <p className="text-destructive">Clube não encontrado ou não é público.</p>
        <Button asChild variant="outline" className="w-fit">
          <Link to="/explorar">Voltar para Explorar</Link>
        </Button>
      </div>
    );
  }

  const locationLabel =
    club.city && club.state
      ? `${club.city.name}, ${club.state.code}`
      : "Local não informado";

  const handleGoToClub = () => {
    setSelectedClubId(club.id);
    navigate("/home");
  };

  const handleJoinCta = () => {
    if (club.joinPolicy === CLUB_JOIN_POLICY_OPEN) {
      joinMutate(club.id);
      return;
    }
    requestMutate(club.id);
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-5 md:py-10">
      <Button asChild variant="ghost" className="w-fit px-0 text-muted-foreground">
        <Link to="/explorar">← Voltar para Explorar</Link>
      </Button>

      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">
          {club.name}
        </h1>
        <p className="text-muted-foreground whitespace-pre-wrap">
          {club.description}
        </p>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Formato</dt>
          <dd className="font-medium text-foreground">
            {club.meetingFormat
              ? meetingFormatLabels[club.meetingFormat]
              : "Não informado"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Local</dt>
          <dd className="font-medium text-foreground">{locationLabel}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Entrada</dt>
          <dd className="font-medium text-foreground">
            {clubJoinPolicyLabels[club.joinPolicy]}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Membros</dt>
          <dd className="font-medium text-foreground">{club.memberCount}</dd>
        </div>
      </dl>

      <div className="flex flex-wrap gap-3">
        {club.isMember ? (
          <Button type="button" onClick={handleGoToClub}>
            Ir ao clube
          </Button>
        ) : club.hasPendingRequest ? (
          <Button type="button" variant="outline" disabled>
            Aguardando aprovação
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleJoinCta}
            disabled={isJoining || isRequesting}
          >
            {isJoining || isRequesting
              ? "Enviando…"
              : club.joinPolicy === CLUB_JOIN_POLICY_OPEN
                ? "Entrar"
                : "Pedir entrada"}
          </Button>
        )}
      </div>
    </div>
  );
}
