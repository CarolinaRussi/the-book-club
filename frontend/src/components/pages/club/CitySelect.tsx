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
import { cn } from "@/lib/utils";

type CitySelectProps = {
  stateId: number | null;
  value: number | null;
  onChange: (cityId: number | null) => void;
};

export function CitySelect({ stateId, value, onChange }: CitySelectProps) {
  const [open, setOpen] = useState(false);

  const { data: cities = [], isLoading } = useQuery({
    queryKey: ["locations", "cities", stateId],
    queryFn: () => fetchCitiesByStateId(stateId as number),
    enabled: stateId != null,
  });

  const selectedName =
    value != null
      ? cities.find((cityRow) => Number(cityRow.id) === Number(value))?.name
      : null;

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
          {selectedName ??
            (isLoading
              ? "Carregando cidades…"
              : stateId
                ? "Buscar cidade"
                : "Selecione o estado primeiro")}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Digite o nome da cidade…" />
          <CommandList>
            <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
            <CommandGroup>
              {cities.map((cityRow) => (
                <CommandItem
                  key={cityRow.id}
                  value={cityRow.name}
                  onSelect={() => {
                    onChange(cityRow.id);
                    setOpen(false);
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
      </PopoverContent>
    </Popover>
  );
}
