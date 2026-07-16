import { useFormContext, Controller } from "react-hook-form";
import { FaCheck, FaRegCopy } from "react-icons/fa6";
import type { IClub } from "@/types/IClubs";
import {
  CLUB_JOIN_POLICY_APPROVAL,
  CLUB_READING_MODE_VALUES,
  CLUB_VISIBILITY_PRIVATE,
  CLUB_VISIBILITY_PUBLIC,
  PUBLIC_CLUB_DESCRIPTION_MIN_LENGTH,
  clubReadingModeLabels,
  type ClubReadingMode,
  type MeetingFormat,
} from "@/utils/constants/clubs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ClubMetadataFields,
  type ClubMetadataFormValues,
} from "@/components/pages/club/ClubMetadataFields";

export type ManageClubFormValues = ClubMetadataFormValues & {
  name: string;
  description: string;
  invitationCode: string;
  readingMode: ClubReadingMode;
};

export function toManageClubFormValues(club: IClub): ManageClubFormValues {
  return {
    name: club.name || "",
    description: club.description || "",
    invitationCode: club.invitationCode || "",
    readingMode: club.readingMode ?? "book",
    visibility: club.visibility ?? CLUB_VISIBILITY_PRIVATE,
    joinPolicy: club.joinPolicy ?? CLUB_JOIN_POLICY_APPROVAL,
    meetingFormat: (club.meetingFormat ?? "") as MeetingFormat | "",
    stateId: club.stateId != null ? Number(club.stateId) : null,
    cityId: club.cityId != null ? Number(club.cityId) : null,
    publicListingAcknowledged: club.visibility === CLUB_VISIBILITY_PUBLIC,
  };
}

type ManageClubDetailsFormProps = {
  isUpdating: boolean;
  copiedLink: boolean;
  onCopyInviteLink: () => void;
};

export function ManageClubDetailsForm({
  isUpdating,
  copiedLink,
  onCopyInviteLink,
}: ManageClubDetailsFormProps) {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<ManageClubFormValues>();

  const visibility = watch("visibility");

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Detalhes do clube</h2>
      <div className="grid gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Nome</label>
          <Input
            {...register("name", { required: true })}
            placeholder="Nome do clube"
          />
          {errors.name ? (
            <span className="text-xs text-red-500">Obrigatório</span>
          ) : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Descrição</label>
          <Input
            {...register("description", {
              validate: (value) =>
                visibility !== CLUB_VISIBILITY_PUBLIC ||
                value.trim().length >= PUBLIC_CLUB_DESCRIPTION_MIN_LENGTH
                  ? true
                  : `Mínimo de ${PUBLIC_CLUB_DESCRIPTION_MIN_LENGTH} caracteres para clube público`,
            })}
            placeholder="Descrição do clube"
          />
          {errors.description?.message ? (
            <span className="text-xs text-red-500">
              {errors.description.message}
            </span>
          ) : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Código de convite
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              {...register("invitationCode")}
              placeholder="Código"
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={onCopyInviteLink}
              className="shrink-0"
            >
              {copiedLink ? (
                <>
                  <FaCheck className="text-green-600" />
                  Link copiado
                </>
              ) : (
                <>
                  <FaRegCopy />
                  Copiar link
                </>
              )}
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Alterar o código invalida links de convite antigos.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Modo de leitura
          </label>
          <Controller
            control={control}
            name="readingMode"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o modo de leitura" />
                </SelectTrigger>
                <SelectContent>
                  {CLUB_READING_MODE_VALUES.map((readingMode) => (
                    <SelectItem key={readingMode} value={readingMode}>
                      {clubReadingModeLabels[readingMode]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <ClubMetadataFields />
      </div>

      <Button type="submit" disabled={isUpdating} className="w-full sm:w-auto">
        {isUpdating ? "Salvando..." : "Salvar dados"}
      </Button>
    </div>
  );
}
