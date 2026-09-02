import { useState } from "react";
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

type CitySelectProps = {
  stateId: number | null;
  value: number | null;
  onChange: (cityId: number | null) => void;
  allowClear?: boolean;
};

function CityCommandList({
  cities,
  value,
  onChange,
  allowClear,
  onPicked,
}: {
  cities: { id: number; name: string }[];
  value: number | null;
  onChange: (cityId: number | null) => void;
  allowClear: boolean;
  onPicked: () => void;
}) {
  return (
    <Command>
      <CommandInput placeholder="Digite o nome da cidade…" />
      <CommandList onWheel={(event) => event.stopPropagation()}>
        <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
        <CommandGroup>
          {allowClear ? (
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
          ) : null}
          {cities.map((cityRow) => (
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
      </CommandList>
    </Command>
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
  // ponytail: Popover portals outside Vaul drawer → inert/focus trap blocks input+scroll. Inline only inside mobile drawer; Popover elsewhere.
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
          <div
            data-vaul-no-drag
            className="rounded-md border bg-popover text-popover-foreground shadow-md"
          >
            <CityCommandList
              cities={cities}
              value={value}
              onChange={onChange}
              allowClear={allowClear}
              onPicked={() => setOpen(false)}
            />
          </div>
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
