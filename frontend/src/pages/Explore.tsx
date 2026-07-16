import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchDiscoverClubs } from "@/api/queries/fetchDiscoverClubs";
import { fetchCitiesByStateId, fetchStates } from "@/api/queries/fetchLocations";
import { DiscoverClubCard } from "@/components/pages/explore/DiscoverClubCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MEETING_FORMAT_VALUES,
  meetingFormatLabels,
  type MeetingFormat,
} from "@/utils/constants/clubs";

const ALL_VALUE = "all";

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

  const filters = useMemo(
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
    queryKey: ["discoverClubs", filters],
    queryFn: () => fetchDiscoverClubs(filters),
    placeholderData: (previous) => previous,
  });

  const clubs = data?.data ?? [];
  const totalPages = data?.totalPages ?? 0;

  const applySearch = () => {
    setPage(1);
    setAppliedSearch(searchInput.trim());
  };

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

      <div className="grid gap-3 rounded-xl border border-border p-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <label className="mb-1 block text-sm font-medium">Busca</label>
          <div className="flex gap-2">
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  applySearch();
                }
              }}
              placeholder="Nome ou descrição"
            />
            <Button type="button" variant="outline" onClick={applySearch}>
              Buscar
            </Button>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Formato</label>
          <Select
            value={meetingFormat || ALL_VALUE}
            onValueChange={(value) => {
              setPage(1);
              setMeetingFormat(value === ALL_VALUE ? "" : (value as MeetingFormat));
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>Todos</SelectItem>
              {MEETING_FORMAT_VALUES.map((format) => (
                <SelectItem key={format} value={format}>
                  {meetingFormatLabels[format]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Estado</label>
          <Select
            value={stateId != null ? String(stateId) : ALL_VALUE}
            onValueChange={(value) => {
              setPage(1);
              setCityId(null);
              setStateId(value === ALL_VALUE ? null : Number(value));
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>Todos</SelectItem>
              {states.map((stateRow) => (
                <SelectItem key={stateRow.id} value={String(stateRow.id)}>
                  {stateRow.code} — {stateRow.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2 lg:col-span-4">
          <label className="mb-1 block text-sm font-medium">Cidade</label>
          <Select
            value={cityId != null ? String(cityId) : ALL_VALUE}
            onValueChange={(value) => {
              setPage(1);
              setCityId(value === ALL_VALUE ? null : Number(value));
            }}
            disabled={stateId == null}
          >
            <SelectTrigger className="w-full md:max-w-md">
              <SelectValue
                placeholder={
                  stateId == null
                    ? "Selecione um estado primeiro"
                    : "Todas as cidades"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>Todas</SelectItem>
              {cities.map((cityRow) => (
                <SelectItem key={cityRow.id} value={String(cityRow.id)}>
                  {cityRow.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

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
