import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { FaCheck, FaRegCopy } from "react-icons/fa6";
import { useAuth } from "@/contexts/AuthContext";
import { useClub } from "@/contexts/ClubContext";
import { updateClub, deleteClub } from "@/api/mutations/clubMutate";
import type { IApiError } from "@/types/IApi";
import {
  CLUB_READING_MODE_VALUES,
  clubReadingModeLabels,
  type ClubReadingMode,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ManageClubFormValues {
  name: string;
  description: string;
  invitationCode: string;
  readingMode: ClubReadingMode;
}

export default function ManageClub() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { clubs, selectedClubId } = useClub();
  const [copiedLink, setCopiedLink] = useState(false);

  const selectedClub = clubs.find((club) => club.id === selectedClubId);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ManageClubFormValues>({
    defaultValues: {
      name: "",
      description: "",
      invitationCode: "",
      readingMode: "book",
    },
  });

  const invitationCodeValue = watch("invitationCode");

  useEffect(() => {
    if (!selectedClub) return;
    reset({
      name: selectedClub.name || "",
      description: selectedClub.description || "",
      invitationCode: selectedClub.invitationCode || "",
      readingMode: selectedClub.readingMode ?? "book",
    });
  }, [selectedClub, reset]);

  const { mutate: updateClubMutate, isPending: isUpdating } = useMutation<
    unknown,
    IApiError,
    { id: string } & ManageClubFormValues
  >({
    mutationFn: updateClub,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["userClubs"] });
      await queryClient.invalidateQueries({ queryKey: ["bookUsers"] });
      toast.success("Alterações salvas");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao salvar alterações.");
    },
  });

  const { mutate: deleteClubMutate, isPending: isDeleting } = useMutation<
    unknown,
    IApiError,
    string
  >({
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
    onError: (error) =>
      toast.error(error.message || "Erro ao excluir o clube."),
  });

  const onSubmit: SubmitHandler<ManageClubFormValues> = (data) => {
    if (!selectedClub) return;
    updateClubMutate({ id: selectedClub.id, ...data });
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

  if (!user || !selectedClub) return null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-5 md:py-12">
      <div>
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">
          Gerenciar clube
        </h1>
        <p className="mt-2 text-muted-foreground">
          Dados e configurações de{" "}
          <span className="font-medium text-foreground">
            {selectedClub.name}
          </span>
          .
        </p>
      </div>

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
                {...register("description")}
                placeholder="Descrição do clube"
              />
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

      <div className="space-y-3 border-t pt-8">
        <h2 className="text-sm font-bold uppercase tracking-wider text-primary">
          Zona de perigo
        </h2>
        <div className="flex flex-col gap-4 rounded-md border bg-secondary/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-primary">
            <p className="font-medium">Excluir este clube</p>
            <p className="text-xs text-muted-foreground">
              Esta ação não pode ser desfeita.
            </p>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="destructive"
                disabled={isDeleting}
                className="w-full sm:w-auto"
              >
                {isDeleting ? "Excluindo..." : "Excluir clube"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Você tem certeza absoluta disso?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. O clube{" "}
                  <span className="font-bold">{selectedClub.name}</span>, seus
                  membros, encontros e a lista de livros deste clube serão
                  removidos. Os livros continuam no catálogo geral do sistema
                  quando também existem em outros clubes ou na sua biblioteca
                  pessoal.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteClubMutate(selectedClub.id)}
                  className="bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive"
                >
                  Confirmar exclusão
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
