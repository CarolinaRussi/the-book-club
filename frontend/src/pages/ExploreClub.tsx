import { Link, useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { fetchPublicClubPreview } from "@/api/queries/fetchDiscoverClubs";
import { Button } from "@/components/ui/button";
import { useClub } from "@/contexts/ClubContext";
import {
  CLUB_JOIN_POLICY_OPEN,
  clubJoinPolicyLabels,
  meetingFormatLabels,
} from "@/utils/constants/clubs";

export default function ExploreClub() {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const { setSelectedClubId } = useClub();

  const { data: club, isLoading, isError } = useQuery({
    queryKey: ["publicClubPreview", clubId],
    queryFn: () => fetchPublicClubPreview(clubId as string),
    enabled: !!clubId,
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

  const handleJoinCta = () => {
    if (club.joinPolicy === CLUB_JOIN_POLICY_OPEN) {
      toast.info("A entrada direta por Explorar chega na próxima etapa.");
      return;
    }
    toast.info("Os pedidos de entrada chegam na próxima etapa.");
  };

  const handleGoToClub = () => {
    setSelectedClubId(club.id);
    navigate("/home");
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
        ) : (
          <Button type="button" onClick={handleJoinCta}>
            {club.joinPolicy === CLUB_JOIN_POLICY_OPEN
              ? "Entrar"
              : "Pedir entrada"}
          </Button>
        )}
      </div>
    </div>
  );
}
