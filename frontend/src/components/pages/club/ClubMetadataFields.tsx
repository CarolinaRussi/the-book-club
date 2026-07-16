import { Controller, useFormContext } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { fetchStates } from "@/api/queries/fetchLocations";
import { CitySelect } from "@/components/pages/club/CitySelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CLUB_JOIN_POLICY_APPROVAL,
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

type ClubMetadataFieldsProps = {
  requireLocation?: boolean;
};

export function ClubMetadataFields({
  requireLocation = false,
}: ClubMetadataFieldsProps) {
  const {
    control,
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<ClubMetadataFormValues>();

  const visibility = watch("visibility");
  const stateId = watch("stateId");
  const isPublic = visibility === CLUB_VISIBILITY_PUBLIC;
  const locationRequired = requireLocation || isPublic;

  const { data: states = [], isLoading: isLoadingStates } = useQuery({
    queryKey: ["locations", "states"],
    queryFn: fetchStates,
  });

  return (
    <div className="grid gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Visibilidade</label>
        <Controller
          control={control}
          name="visibility"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(value: ClubVisibility) => {
                field.onChange(value);
                if (value === CLUB_VISIBILITY_PUBLIC) {
                  setValue("joinPolicy", CLUB_JOIN_POLICY_APPROVAL);
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
            name="joinPolicy"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
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
          name="meetingFormat"
          rules={{ required: locationRequired ? "Obrigatório" : false }}
          render={({ field }) => (
            <Select
              value={field.value || undefined}
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
          name="stateId"
          rules={{ required: locationRequired ? "Obrigatório" : false }}
          render={({ field }) => (
            <Select
              value={field.value != null ? String(field.value) : undefined}
              onValueChange={(value) => {
                field.onChange(Number(value));
                setValue("cityId", null);
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
          name="cityId"
          rules={{ required: locationRequired ? "Obrigatório" : false }}
          render={({ field }) => (
            <CitySelect
              stateId={stateId}
              value={field.value}
              onChange={field.onChange}
            />
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
            className="mt-1 accent-primary"
            {...register("publicListingAcknowledged", {
              required: "Confirme que o perfil ficará público",
            })}
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
