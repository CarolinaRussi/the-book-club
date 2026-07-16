import { useEffect, useMemo, useState } from "react";
import {
  Controller,
  type Control,
  type FieldErrors,
  type FieldPath,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch,
} from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";
import { fetchCitiesByStateId, fetchStates } from "@/api/queries/fetchLocations";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  CLUB_JOIN_POLICY_VALUES,
  CLUB_VISIBILITY_PUBLIC,
  CLUB_VISIBILITY_VALUES,
  MEETING_FORMAT_VALUES,
  PUBLIC_CLUB_DESCRIPTION_MIN_LENGTH,
  clubJoinPolicyLabels,
  clubVisibilityLabels,
  meetingFormatLabels,
  type ClubJoinPolicy,
  type ClubVisibility,
  type MeetingFormat,
} from "@/utils/constants/clubs";

export type ClubMetadataFormValues = {
  visibility: ClubVisibility;
  joinPolicy: ClubJoinPolicy;
  meetingFormat: MeetingFormat | "";
  stateId: number | null;
  cityId: number | null;
  publicListingAcknowledged: boolean;
};

type ClubMetadataFieldsProps<TFieldValues extends ClubMetadataFormValues> = {
  control: Control<TFieldValues>;
  register: UseFormRegister<TFieldValues>;
  watch: UseFormWatch<TFieldValues>;
  setValue: UseFormSetValue<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  requireLocation: boolean;
};

export function ClubMetadataFields<
  TFieldValues extends ClubMetadataFormValues,
>({
  control,
  register,
  watch,
  setValue,
  errors,
  requireLocation,
}: ClubMetadataFieldsProps<TFieldValues>) {
  const [cityPopoverOpen, setCityPopoverOpen] = useState(false);
  const visibility = watch("visibility" as FieldPath<TFieldValues>);
  const stateId = watch("stateId" as FieldPath<TFieldValues>);
  const cityId = watch("cityId" as FieldPath<TFieldValues>);
  const isPublic = visibility === CLUB_VISIBILITY_PUBLIC;

  const { data: states = [], isLoading: isLoadingStates } = useQuery({
    queryKey: ["locations", "states"],
    queryFn: fetchStates,
  });

  const numericStateId =
    typeof stateId === "number" && stateId > 0 ? stateId : null;

  const { data: cities = [], isLoading: isLoadingCities } = useQuery({
    queryKey: ["locations", "cities", numericStateId],
    queryFn: () => fetchCitiesByStateId(numericStateId as number),
    enabled: numericStateId != null,
  });

  useEffect(() => {
    if (!isPublic) {
      setValue(
        "publicListingAcknowledged" as FieldPath<TFieldValues>,
        false as never,
      );
    }
  }, [isPublic, setValue]);

  const selectedCityName = useMemo(() => {
    if (typeof cityId !== "number") return null;
    return cities.find((cityRow) => cityRow.id === cityId)?.name ?? null;
  }, [cities, cityId]);

  return (
    <div className="grid gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Visibilidade</label>
        <Controller
          control={control}
          name={"visibility" as FieldPath<TFieldValues>}
          rules={{ required: true }}
          render={({ field }) => (
            <Select
              value={String(field.value)}
              onValueChange={(value) => {
                field.onChange(value);
                if (value === CLUB_VISIBILITY_PUBLIC) {
                  setValue(
                    "joinPolicy" as FieldPath<TFieldValues>,
                    "approval" as never,
                  );
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {CLUB_VISIBILITY_VALUES.map((visibilityValue) => (
                  <SelectItem key={visibilityValue} value={visibilityValue}>
                    {clubVisibilityLabels[visibilityValue]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {isPublic ? (
        <div>
          <label className="mb-1 block text-sm font-medium">
            Entrada no clube
          </label>
          <Controller
            control={control}
            name={"joinPolicy" as FieldPath<TFieldValues>}
            rules={{ required: isPublic }}
            render={({ field }) => (
              <Select
                value={String(field.value)}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {CLUB_JOIN_POLICY_VALUES.map((joinPolicy) => (
                    <SelectItem key={joinPolicy} value={joinPolicy}>
                      {clubJoinPolicyLabels[joinPolicy]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      ) : null}

      <div>
        <label className="mb-1 block text-sm font-medium">
          Formato dos encontros
        </label>
        <Controller
          control={control}
          name={"meetingFormat" as FieldPath<TFieldValues>}
          rules={{
            validate: (value) =>
              !requireLocation && !isPublic
                ? true
                : value
                  ? true
                  : "Obrigatório",
          }}
          render={({ field }) => (
            <Select
              value={field.value ? String(field.value) : undefined}
              onValueChange={field.onChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o formato" />
              </SelectTrigger>
              <SelectContent>
                {MEETING_FORMAT_VALUES.map((format) => (
                  <SelectItem key={format} value={format}>
                    {meetingFormatLabels[format]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.meetingFormat ? (
          <span className="text-xs text-red-500">Obrigatório</span>
        ) : null}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Estado (UF)</label>
        <Controller
          control={control}
          name={"stateId" as FieldPath<TFieldValues>}
          rules={{
            validate: (value) =>
              !requireLocation && !isPublic
                ? true
                : value
                  ? true
                  : "Obrigatório",
          }}
          render={({ field }) => (
            <Select
              value={
                typeof field.value === "number" ? String(field.value) : undefined
              }
              onValueChange={(value) => {
                field.onChange(Number(value));
                setValue("cityId" as FieldPath<TFieldValues>, null as never);
              }}
              disabled={isLoadingStates}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    isLoadingStates ? "Carregando…" : "Selecione o estado"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {states.map((stateRow) => (
                  <SelectItem key={stateRow.id} value={String(stateRow.id)}>
                    {stateRow.code} — {stateRow.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.stateId ? (
          <span className="text-xs text-red-500">Obrigatório</span>
        ) : null}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Cidade</label>
        <Controller
          control={control}
          name={"cityId" as FieldPath<TFieldValues>}
          rules={{
            validate: (value) =>
              !requireLocation && !isPublic
                ? true
                : value
                  ? true
                  : "Obrigatório",
          }}
          render={({ field }) => (
            <Popover open={cityPopoverOpen} onOpenChange={setCityPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  disabled={numericStateId == null || isLoadingCities}
                  className="w-full justify-between font-normal"
                >
                  {selectedCityName ??
                    (isLoadingCities
                      ? "Carregando cidades…"
                      : numericStateId
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
                            field.onChange(cityRow.id);
                            setCityPopoverOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 size-4",
                              field.value === cityRow.id
                                ? "opacity-100"
                                : "opacity-0",
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
          )}
        />
        {errors.cityId ? (
          <span className="text-xs text-red-500">Obrigatório</span>
        ) : null}
      </div>

      {isPublic ? (
        <label className="flex items-start gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            className="mt-1"
            {...register(
              "publicListingAcknowledged" as FieldPath<TFieldValues>,
              {
                required: isPublic
                  ? "Confirme que o perfil ficará público"
                  : false,
              },
            )}
          />
          <span>
            Entendo que o nome, a descrição, o formato e a cidade/UF deste clube
            ficarão visíveis na listagem pública (Explorar). A descrição precisa
            ter pelo menos {PUBLIC_CLUB_DESCRIPTION_MIN_LENGTH} caracteres.
          </span>
        </label>
      ) : null}
      {errors.publicListingAcknowledged ? (
        <span className="text-xs text-red-500">
          Confirme a ciência para publicar o clube.
        </span>
      ) : null}
    </div>
  );
}
