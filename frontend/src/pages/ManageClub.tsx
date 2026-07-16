import { useState } from "react";
import { useNavigate } from "react-router";
import { FormProvider, useForm, type SubmitHandler } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import { useClub } from "@/contexts/ClubContext";
import { updateClub, deleteClub } from "@/api/mutations/clubMutate";
import type { IApiError } from "@/types/IApi";
import type { IClub } from "@/types/IClubs";
import {
  CLUB_JOIN_POLICY_OPEN,
  CLUB_VISIBILITY_PUBLIC,
} from "@/utils/constants/clubs";
import { buildInviteUrl } from "@/utils/inviteUrl";
import { JoinRequestsPanel } from "@/components/pages/club/JoinRequestsPanel";
import { ManageClubDangerZone } from "@/components/pages/club/ManageClubDangerZone";
import {
  ManageClubDetailsForm,
  toManageClubFormValues,
  type ManageClubFormValues,
} from "@/components/pages/club/ManageClubDetailsForm";

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
    defaultValues: toManageClubFormValues(club),
    values: toManageClubFormValues(club),
  });

  const { handleSubmit, watch } = form;
  const invitationCodeValue = watch("invitationCode");

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
          <ManageClubDetailsForm
            isUpdating={isUpdating}
            copiedLink={copiedLink}
            onCopyInviteLink={handleCopyInviteLink}
          />
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
