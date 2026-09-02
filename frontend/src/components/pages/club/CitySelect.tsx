import { useMemo, useState } from "react";
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

function filterCitiesByQuery(cities: CityOption[], query: string) {
  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
  if (normalizedQuery.length < MIN_CITY_QUERY_LENGTH) {
    return [];
  }
  return cities.filter((cityRow) =>
    cityRow.name.toLocaleLowerCase("pt-BR").includes(normalizedQuery),
  );
}

function CityCommandList({
  cities,
  value,
  onChange,
  allowClear,
  onPicked,
}: {
  cities: CityOption[];
  value: number | null;
  onChange: (cityId: number | null) => void;
  allowClear: boolean;
  onPicked: () => void;
}) {
  const [query, setQuery] = useState("");
  const trimmedQuery = query.trim();
  const canSearch = trimmedQuery.length >= MIN_CITY_QUERY_LENGTH;
  const filteredCities = useMemo(
    () => filterCitiesByQuery(cities, query),
    [cities, query],
  );

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
        ) : (
          <>
            <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
            <CommandGroup>
              {filteredCities.map((cityRow) => (
                <CommandItem
                  key={cityRow.id}
                  value={cityRow.name}
                  onSelect={() => {
                    onChange(cityRow.id);
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
  cities,
  value,
  onChange,
  allowClear,
  onPicked,
}: {
  cities: CityOption[];
  value: number | null;
  onChange: (cityId: number | null) => void;
  allowClear: boolean;
  onPicked: () => void;
}) {
  const [query, setQuery] = useState("");
  const trimmedQuery = query.trim();
  const canSearch = trimmedQuery.length >= MIN_CITY_QUERY_LENGTH;
  const filteredCities = useMemo(
    () => filterCitiesByQuery(cities, query),
    [cities, query],
  );

  return (
    <div
      data-vaul-no-drag
      className="overflow-hidden rounded-md border bg-background text-foreground"
    >
      <input
        type="search"
        value={query}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        placeholder="Digite ao menos 3 letras…"
        className="h-11 w-full border-b border-input bg-transparent px-3 text-base outline-none placeholder:text-muted-foreground"
        onChange={(event) => setQuery(event.target.value)}
        onTouchStart={(event) => event.stopPropagation()}
      />
      <ul
        data-vaul-no-drag
        className="max-h-52 touch-pan-y overflow-y-auto overscroll-contain"
        onTouchStart={(event) => event.stopPropagation()}
        onTouchMove={(event) => event.stopPropagation()}
      >
        {allowClear ? (
          <li>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-base"
              onClick={() => {
                onChange(null);
                onPicked();
              }}
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
          <li className="px-3 py-6 text-center text-sm text-muted-foreground">
            Digite pelo menos {MIN_CITY_QUERY_LENGTH} letras para buscar
          </li>
        ) : filteredCities.length === 0 ? (
          <li className="px-3 py-6 text-center text-sm text-muted-foreground">
            Nenhuma cidade encontrada.
          </li>
        ) : (
          filteredCities.map((cityRow) => (
            <li key={cityRow.id}>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-base"
                onClick={() => {
                  onChange(cityRow.id);
                  onPicked();
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
  const responsiveDialog = useOptionalResponsiveDialog();
  // ponytail: Popover/cmdk inside Vaul drawer = zoom + broken touch scroll. Plain 16px input + list only in mobile drawer.
  const useInlineList =
    responsiveDialog != null && !responsiveDialog.isDesktop;

  const { data: cities = [], isLoading } = useQuery({
    queryKey: ["locations", "cities", stateId],
    queryFn: () => fetchCitiesByStateId(stateId as number),
    enabled: stateId != null,
  });

  const selectedName =
    value != null
      ? cities.find((cityRow) => Number(cityRow.id) === Number(value))?.name
      : null;

  const triggerLabel =
    selectedName ??
    (isLoading
      ? "Carregando cidades…"
      : stateId
        ? allowClear
          ? "Todas as cidades"
          : "Buscar cidade"
        : "Selecione o estado primeiro");

  if (useInlineList) {
    return (
      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          role="combobox"
          disabled={stateId == null || isLoading}
          aria-expanded={open}
          className="w-full justify-between font-normal"
          onClick={() => setOpen((currentOpen) => !currentOpen)}
        >
          {triggerLabel}
          <ChevronsUpDown className="opacity-50" />
        </Button>
        {open && stateId != null && !isLoading ? (
          <MobileCityPicker
            cities={cities}
            value={value}
            onChange={onChange}
            allowClear={allowClear}
            onPicked={() => setOpen(false)}
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
          disabled={stateId == null || isLoading}
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
        <CityCommandList
          cities={cities}
          value={value}
          onChange={onChange}
          allowClear={allowClear}
          onPicked={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  );
}
