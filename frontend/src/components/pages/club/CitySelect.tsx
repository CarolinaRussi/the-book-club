import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";
import { fetchCitiesByStateId } from "@/api/queries/fetchLocations";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useOptionalResponsiveDialog } from "@/components/ui/responsive-dialog";
import { cn } from "@/lib/utils";

const MIN_CITY_QUERY_LENGTH = 3;

type CitySelectProps = {
  stateId: number | null;
  value: number | null;
  onChange: (cityId: number | null) => void;
  allowClear?: boolean;
};

type CityOption = { id: number; name: string };

function useCitySearch(stateId: number | null, query: string) {
  const trimmedQuery = query.trim();
  const canSearch = trimmedQuery.length >= MIN_CITY_QUERY_LENGTH;

  const { data: cities = [], isFetching } = useQuery({
    queryKey: ["locations", "cities", stateId, trimmedQuery],
    queryFn: () => fetchCitiesByStateId(stateId as number, trimmedQuery),
    enabled: stateId != null && canSearch,
  });

  return { cities, isFetching, canSearch, trimmedQuery };
}

function CityCommandList({
  stateId,
  value,
  onChange,
  allowClear,
  onPicked,
}: {
  stateId: number;
  value: number | null;
  onChange: (cityId: number | null, cityName?: string) => void;
  allowClear: boolean;
  onPicked: () => void;
}) {
  const [query, setQuery] = useState("");
  const { cities, isFetching, canSearch } = useCitySearch(stateId, query);

  return (
    <Command shouldFilter={false}>
      <CommandInput
        value={query}
        placeholder="Digite ao menos 3 letras…"
        onValueChange={setQuery}
      />
      <CommandList onWheel={(event) => event.stopPropagation()}>
        {allowClear ? (
          <CommandGroup>
            <CommandItem
              value="todas as cidades"
              onSelect={() => {
                onChange(null);
                onPicked();
              }}
            >
              <Check
                className={cn(
                  "mr-2 size-4",
                  value == null ? "opacity-100" : "opacity-0",
                )}
              />
              Todas as cidades
            </CommandItem>
          </CommandGroup>
        ) : null}
        {!canSearch ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            Digite pelo menos {MIN_CITY_QUERY_LENGTH} letras para buscar
          </p>
        ) : isFetching ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            Buscando…
          </p>
        ) : (
          <>
            <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
            <CommandGroup>
              {cities.map((cityRow: CityOption) => (
                <CommandItem
                  key={cityRow.id}
                  value={cityRow.name}
                  onSelect={() => {
                    onChange(cityRow.id, cityRow.name);
                    onPicked();
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      value === cityRow.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {cityRow.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </Command>
  );
}

function MobileCityPicker({
  stateId,
  value,
  onChange,
  allowClear,
}: {
  stateId: number;
  value: number | null;
  onChange: (cityId: number | null, cityName?: string) => void;
  allowClear: boolean;
}) {
  const [query, setQuery] = useState("");
  const { cities, isFetching, canSearch } = useCitySearch(stateId, query);

  useEffect(() => {
    setQuery("");
  }, [stateId]);

  return (
    <div
      data-vaul-no-drag
      className="overflow-hidden rounded-md border border-input bg-background text-foreground"
    >
      <input
        type="search"
        value={query}
        enterKeyHint="search"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        placeholder="Digite ao menos 3 letras…"
        className="h-11 w-full border-b border-input bg-transparent px-3 text-base outline-none placeholder:text-muted-foreground"
        onChange={(event) => setQuery(event.target.value)}
      />
      <ul className="max-h-52 touch-pan-y overflow-y-auto overscroll-contain">
        {allowClear ? (
          <li>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-base"
              onClick={() => onChange(null)}
            >
              <Check
                className={cn(
                  "size-4 shrink-0",
                  value == null ? "opacity-100" : "opacity-0",
                )}
              />
              Todas as cidades
            </button>
          </li>
        ) : null}
        {!canSearch ? (
          <li className="px-3 py-4 text-center text-sm text-muted-foreground">
            Digite pelo menos {MIN_CITY_QUERY_LENGTH} letras para buscar
          </li>
        ) : isFetching ? (
          <li className="px-3 py-4 text-center text-sm text-muted-foreground">
            Buscando…
          </li>
        ) : cities.length === 0 ? (
          <li className="px-3 py-4 text-center text-sm text-muted-foreground">
            Nenhuma cidade encontrada.
          </li>
        ) : (
          cities.map((cityRow) => (
            <li key={cityRow.id}>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-base"
                onClick={() => {
                  onChange(cityRow.id, cityRow.name);
                  setQuery("");
                }}
              >
                <Check
                  className={cn(
                    "size-4 shrink-0",
                    value === cityRow.id ? "opacity-100" : "opacity-0",
                  )}
                />
                {cityRow.name}
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export function CitySelect({
  stateId,
  value,
  onChange,
  allowClear = false,
}: CitySelectProps) {
  const [open, setOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const responsiveDialog = useOptionalResponsiveDialog();
  // ponytail: inside Vaul drawer, avoid Popover + toggle button (touch stolen by drawer drag). Always-on search field + handleOnly on drawer.
  const useInlineList =
    responsiveDialog != null && !responsiveDialog.isDesktop;

  useEffect(() => {
    setOpen(false);
    setSelectedLabel(null);
  }, [stateId]);

  useEffect(() => {
    if (value == null) {
      setSelectedLabel(null);
    }
  }, [value]);

  const { data: citiesForLabel = [] } = useQuery({
    queryKey: ["locations", "cities", stateId, "label", value],
    queryFn: () => fetchCitiesByStateId(stateId as number),
    enabled: stateId != null && value != null && selectedLabel == null,
  });

  useEffect(() => {
    if (selectedLabel != null || value == null) {
      return;
    }
    const matchedCity = citiesForLabel.find(
      (cityRow) => Number(cityRow.id) === Number(value),
    );
    if (matchedCity) {
      setSelectedLabel(matchedCity.name);
    }
  }, [citiesForLabel, selectedLabel, value]);

  const handleChange = (cityId: number | null, cityName?: string) => {
    onChange(cityId);
    setSelectedLabel(cityId == null ? null : (cityName ?? null));
  };

  const triggerLabel =
    selectedLabel ??
    (stateId
      ? allowClear
        ? "Todas as cidades"
        : "Buscar cidade"
      : "Selecione o estado primeiro");

  if (useInlineList) {
    if (stateId == null) {
      return (
        <div className="flex h-10 items-center rounded-md border border-input px-3 text-sm text-muted-foreground">
          Selecione o estado primeiro
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {selectedLabel ? (
          <div className="flex items-center justify-between gap-2 rounded-md border border-input px-3 py-2 text-base">
            <span className="truncate">{selectedLabel}</span>
            <button
              type="button"
              className="shrink-0 text-sm text-primary underline-offset-2 hover:underline"
              onClick={() => handleChange(null)}
            >
              Trocar
            </button>
          </div>
        ) : null}
        {!selectedLabel || allowClear ? (
          <MobileCityPicker
            stateId={stateId}
            value={value}
            onChange={handleChange}
            allowClear={allowClear}
          />
        ) : null}
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          disabled={stateId == null}
          className="w-full justify-between font-normal"
        >
          {triggerLabel}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        align="start"
      >
        {stateId != null ? (
          <CityCommandList
            stateId={stateId}
            value={value}
            onChange={handleChange}
            allowClear={allowClear}
            onPicked={() => setOpen(false)}
          />
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
