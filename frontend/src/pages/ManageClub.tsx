import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Controller,
  FormProvider,
  useForm,
  type SubmitHandler,
} from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { FaCheck, FaRegCopy } from "react-icons/fa6";
import { useAuth } from "@/contexts/AuthContext";
import { useClub } from "@/contexts/ClubContext";
import { updateClub, deleteClub } from "@/api/mutations/clubMutate";
import type { IApiError } from "@/types/IApi";
import type { IClub } from "@/types/IClubs";
import {
  CLUB_JOIN_POLICY_APPROVAL,
  CLUB_JOIN_POLICY_OPEN,
  CLUB_READING_MODE_VALUES,
  CLUB_VISIBILITY_PRIVATE,
  CLUB_VISIBILITY_PUBLIC,
  PUBLIC_CLUB_DESCRIPTION_MIN_LENGTH,
  clubReadingModeLabels,
  type ClubReadingMode,
  type MeetingFormat,
} from "@/utils/constants/clubs";
import { buildInviteUrl } from "@/utils/inviteUrl";
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
import { JoinRequestsPanel } from "@/components/pages/club/JoinRequestsPanel";
import { ManageClubDangerZone } from "@/components/pages/club/ManageClubDangerZone";

type ManageClubFormValues = ClubMetadataFormValues & {
  name: string;
  description: string;
  invitationCode: string;
  readingMode: ClubReadingMode;
};

function toFormValues(club: IClub): ManageClubFormValues {
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

export default function ManageClub() {
  const { user } = useAuth();
  const { clubs, selectedClubId } = useClub();
  const selectedClub = clubs.find((club) => club.id === selectedClubId);

  if (!user || !selectedClub) return null;

  return <ManageClubForm key={selectedClub.id} club={selectedClub} />;
}

function ManageClubForm({ club }: { club: IClub }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [copiedLink, setCopiedLink] = useState(false);

  const form = useForm<ManageClubFormValues>({
    defaultValues: toFormValues(club),
    values: toFormValues(club),
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = form;

  const invitationCodeValue = watch("invitationCode");
  const visibility = watch("visibility");

  const { mutate: updateClubMutate, isPending: isUpdating } = useMutation({
    mutationFn: updateClub,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["userClubs"] });
      await queryClient.invalidateQueries({ queryKey: ["bookUsers"] });
      toast.success("Alterações salvas");
    },
    onError: (error: IApiError) => {
      toast.error(error.message || "Erro ao salvar alterações.");
    },
  });

  const { mutate: deleteClubMutate, isPending: isDeleting } = useMutation({
    mutationFn: deleteClub,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["userClubs"] });
      await queryClient.invalidateQueries({
        queryKey: ["booksFromSelectedClub"],
      });
      await queryClient.invalidateQueries({ queryKey: ["meetings"] });
      await queryClient.invalidateQueries({ queryKey: ["bookUsers"] });
      toast.success("Clube excluído permanentemente.");
      navigate("/home");
    },
    onError: (error: IApiError) =>
      toast.error(error.message || "Erro ao excluir o clube."),
  });

  const onSubmit: SubmitHandler<ManageClubFormValues> = (data) => {
    if (
      data.visibility === CLUB_VISIBILITY_PUBLIC &&
      data.description.trim().length < PUBLIC_CLUB_DESCRIPTION_MIN_LENGTH
    ) {
      toast.error(
        `Clubes públicos precisam de uma descrição com pelo menos ${PUBLIC_CLUB_DESCRIPTION_MIN_LENGTH} caracteres.`,
      );
      return;
    }

    updateClubMutate({
      id: club.id,
      name: data.name,
      description: data.description,
      invitationCode: data.invitationCode,
      readingMode: data.readingMode,
      visibility: data.visibility,
      joinPolicy:
        data.visibility === CLUB_VISIBILITY_PUBLIC
          ? data.joinPolicy
          : CLUB_JOIN_POLICY_OPEN,
      meetingFormat: data.meetingFormat || null,
      stateId: data.stateId,
      cityId: data.cityId,
    });
  };

  const handleCopyInviteLink = () => {
    const code = invitationCodeValue?.trim();
    if (!code) {
      toast.error("Informe um código de convite antes de copiar o link.");
      return;
    }
    navigator.clipboard.writeText(buildInviteUrl(code));
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    toast.info("Link de convite copiado!");
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-5 md:py-12">
      <div>
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">
          Gerenciar clube
        </h1>
        <p className="mt-2 text-muted-foreground">
          Dados e configurações de{" "}
          <span className="font-medium text-foreground">{club.name}</span>.
        </p>
      </div>

      <FormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              Detalhes do clube
            </h2>
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
                <label className="mb-1 block text-sm font-medium">
                  Descrição
                </label>
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
                    onClick={handleCopyInviteLink}
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

            <Button
              type="submit"
              disabled={isUpdating}
              className="w-full sm:w-auto"
            >
              {isUpdating ? "Salvando..." : "Salvar dados"}
            </Button>
          </div>
        </form>
      </FormProvider>

      <div className="border-t pt-8">
        <JoinRequestsPanel clubId={club.id} />
      </div>

      <ManageClubDangerZone
        clubName={club.name}
        isDeleting={isDeleting}
        onDelete={() => deleteClubMutate(club.id)}
      />
    </div>
  );
}
