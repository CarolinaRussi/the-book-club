import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchDiscoverClubs,
  type DiscoverMapBbox,
} from "@/api/queries/fetchDiscoverClubs";
import { fetchCitiesByStateId, fetchStates } from "@/api/queries/fetchLocations";
import { DiscoverClubCard } from "@/components/pages/explore/DiscoverClubCard";
import { ExploreFilters } from "@/components/pages/explore/ExploreFilters";
import {
  CITY_ZOOM,
  ExploreMap,
  type ExploreMapFlyTo,
} from "@/components/pages/explore/ExploreMap";
import { Button } from "@/components/ui/button";
import type { MeetingFormat } from "@/utils/constants/clubs";

function sameBbox(left: DiscoverMapBbox | null, right: DiscoverMapBbox) {
  return (
    left != null &&
    left.minLat === right.minLat &&
    left.maxLat === right.maxLat &&
    left.minLng === right.minLng &&
    left.maxLng === right.maxLng
  );
}

export default function Explore() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [meetingFormat, setMeetingFormat] = useState<MeetingFormat | "">("");
  const [stateId, setStateId] = useState<number | null>(null);
  const [cityId, setCityId] = useState<number | null>(null);
  const [bbox, setBbox] = useState<DiscoverMapBbox | null>(null);
  const [flyTo, setFlyTo] = useState<ExploreMapFlyTo | null>(null);
  const pendingStateFly = useRef(false);
  const bboxTimeout = useRef<number>(undefined);

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
      bbox: bbox ?? undefined,
    }),
    [page, appliedSearch, meetingFormat, bbox],
  );

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ["discoverClubs", queryFilters],
    queryFn: () => fetchDiscoverClubs(queryFilters),
    enabled: bbox != null,
    placeholderData: (previous) => previous,
  });

  const clubs = data?.data ?? [];
  const mapCities = data?.mapCities ?? [];
  const totalPages = data?.totalPages ?? 0;

  const handleBoundsChange = useMemo(() => {
    return (nextBbox: DiscoverMapBbox) => {
      window.clearTimeout(bboxTimeout.current);
      bboxTimeout.current = window.setTimeout(() => {
        setBbox((current) => {
          if (sameBbox(current, nextBbox)) {
            return current;
          }
          setPage(1);
          return nextBbox;
        });
      }, 350);
    };
  }, []);

  useEffect(() => {
    return () => window.clearTimeout(bboxTimeout.current);
  }, []);

  useEffect(() => {
    if (!pendingStateFly.current || cityId != null) {
      return;
    }
    const citiesWithCoords = cities.filter(
      (cityRow) => cityRow.latitude != null && cityRow.longitude != null,
    );
    if (citiesWithCoords.length === 0) {
      return;
    }
    pendingStateFly.current = false;
    if (citiesWithCoords.length === 1) {
      setFlyTo({
        kind: "point",
        latitude: citiesWithCoords[0].latitude as number,
        longitude: citiesWithCoords[0].longitude as number,
        zoom: CITY_ZOOM,
      });
      return;
    }
    const latitudes = citiesWithCoords.map(
      (cityRow) => cityRow.latitude as number,
    );
    const longitudes = citiesWithCoords.map(
      (cityRow) => cityRow.longitude as number,
    );
    setFlyTo({
      kind: "bounds",
      south: Math.min(...latitudes),
      west: Math.min(...longitudes),
      north: Math.max(...latitudes),
      east: Math.max(...longitudes),
    });
  }, [cities, cityId]);

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 px-4 py-5 md:py-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">
          Explorar
        </h1>
        <p className="mt-2 text-muted-foreground">
          A lista segue a área visível no mapa. Use estado e cidade só para ir
          até um lugar.
        </p>
      </div>

      <ExploreFilters
        filters={{ searchInput, meetingFormat, stateId, cityId }}
        states={states}
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
          if (value == null) {
            pendingStateFly.current = false;
            setFlyTo({ kind: "brazil" });
            return;
          }
          pendingStateFly.current = true;
        }}
        onCityIdChange={(value) => {
          setPage(1);
          setCityId(value);
          if (value == null) {
            pendingStateFly.current = true;
            return;
          }
          pendingStateFly.current = false;
          const selectedCity = cities.find((cityRow) => cityRow.id === value);
          if (
            selectedCity?.latitude == null ||
            selectedCity.longitude == null
          ) {
            return;
          }
          setFlyTo({
            kind: "point",
            latitude: selectedCity.latitude,
            longitude: selectedCity.longitude,
            zoom: CITY_ZOOM,
          });
        }}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <div className="order-2 flex min-w-0 flex-1 flex-col gap-4 lg:order-1 lg:max-w-md">
          {bbox == null || (isLoading && !data) ? (
            <p className="text-muted-foreground">Carregando clubes…</p>
          ) : isError ? (
            <p className="text-destructive">
              Não foi possível carregar os clubes.
            </p>
          ) : clubs.length === 0 ? (
            <p className="text-muted-foreground">
              Nenhum clube público nesta área do mapa.
            </p>
          ) : (
            <div className="grid gap-4">
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

        <div className="order-1 h-[50vh] overflow-hidden rounded-xl border border-border lg:sticky lg:top-4 lg:order-2 lg:h-[calc(100vh-8rem)] lg:min-h-[28rem] lg:flex-1">
          <ExploreMap
            mapCities={mapCities}
            flyTo={flyTo}
            onBoundsChange={handleBoundsChange}
          />
        </div>
      </div>
    </div>
  );
}
