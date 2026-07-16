import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchDiscoverClubs } from "@/api/queries/fetchDiscoverClubs";
import { fetchCitiesByStateId, fetchStates } from "@/api/queries/fetchLocations";
import { DiscoverClubCard } from "@/components/pages/explore/DiscoverClubCard";
import { ExploreFilters } from "@/components/pages/explore/ExploreFilters";
import { Button } from "@/components/ui/button";
import type { MeetingFormat } from "@/utils/constants/clubs";

export default function Explore() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [meetingFormat, setMeetingFormat] = useState<MeetingFormat | "">("");
  const [stateId, setStateId] = useState<number | null>(null);
  const [cityId, setCityId] = useState<number | null>(null);

  const { data: states = [] } = useQuery({
    queryKey: ["locations", "states"],
    queryFn: fetchStates,
  });

  const { data: cities = [] } = useQuery({
    queryKey: ["locations", "cities", stateId],
    queryFn: () => fetchCitiesByStateId(stateId as number),
    enabled: stateId != null,
  });

  const queryFilters = useMemo(
    () => ({
      page,
      limit: 12,
      q: appliedSearch || undefined,
      meetingFormat: meetingFormat || undefined,
      stateId: stateId ?? undefined,
      cityId: cityId ?? undefined,
    }),
    [page, appliedSearch, meetingFormat, stateId, cityId],
  );

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ["discoverClubs", queryFilters],
    queryFn: () => fetchDiscoverClubs(queryFilters),
    placeholderData: (previous) => previous,
  });

  const clubs = data?.data ?? [];
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-5 md:py-10">
      <div>
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">
          Explorar
        </h1>
        <p className="mt-2 text-muted-foreground">
          Encontre clubes públicos por cidade, formato ou nome.
        </p>
      </div>

      <ExploreFilters
        filters={{ searchInput, meetingFormat, stateId, cityId }}
        states={states}
        cities={cities}
        onSearchInputChange={setSearchInput}
        onApplySearch={() => {
          setPage(1);
          setAppliedSearch(searchInput.trim());
        }}
        onMeetingFormatChange={(value) => {
          setPage(1);
          setMeetingFormat(value);
        }}
        onStateIdChange={(value) => {
          setPage(1);
          setCityId(null);
          setStateId(value);
        }}
        onCityIdChange={(value) => {
          setPage(1);
          setCityId(value);
        }}
      />

      {isLoading ? (
        <p className="text-muted-foreground">Carregando clubes…</p>
      ) : isError ? (
        <p className="text-destructive">Não foi possível carregar os clubes.</p>
      ) : clubs.length === 0 ? (
        <p className="text-muted-foreground">
          Nenhum clube público encontrado com esses filtros.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {clubs.map((club) => (
            <DiscoverClubCard key={club.id} club={club} />
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-center gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={page <= 1 || isFetching}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            disabled={page >= totalPages || isFetching}
            onClick={() => setPage((current) => current + 1)}
          >
            Próxima
          </Button>
        </div>
      ) : null}
    </div>
  );
}
