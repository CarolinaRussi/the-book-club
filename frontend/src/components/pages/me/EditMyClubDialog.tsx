import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
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
} from "../../ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tooltip";
import { ScrollArea } from "../../ui/scroll-area";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";

import type { IMembersClub, IUserClub } from "@//types/IClubs";
import type { IApiError } from "@//types/IApi";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { updateClub, deleteClub, banMember } from "@//api/mutations/clubMutate";
import { UserX } from "lucide-react";
import { userStatusLabels } from "@//utils/constants/user";
import { Badge } from "../../ui/badge";

interface EditMyClubDialogProps {
  openDialog: boolean;
  onOpenChange: (open: boolean) => void;
  club: IUserClub | undefined;
}

const EditMyClubDialog = ({
  openDialog,
  onOpenChange,
  club,
}: EditMyClubDialogProps) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<any>({
    defaultValues: {
      name: club?.name || "",
      description: club?.description || "",
      invitationCode: club?.invitationCode || "",
    },
  });

  useEffect(() => {
    if (club) {
      reset({
        name: club.name || "",
        description: club.description || "",
        invitationCode: club.invitationCode || "",
      });
    }
  }, [club, reset, openDialog]);

  const { mutate: updateClubMutate, isPending: isUpdating } = useMutation<
    any,
    IApiError,
    any
  >({
    mutationFn: updateClub,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["userClubs"] });
      toast.success("Alterações salvas");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao salvar alterações.");
    },
  });

  const { mutate: banMemberMutate } = useMutation<any, IApiError, string>({
    mutationFn: (memberId) => banMember(memberId),
    onSuccess: () => {
      //queryClient.invalidateQueries({ queryKey: ["userClubs"] });
      toast.success("Membro removido com sucesso.");
    },
    onError: (error) => toast.error(error.message || "Erro ao banir membro."),
  });

  const { mutate: deleteClubMutate, isPending: isDeleting } = useMutation<
    any,
    IApiError,
    string
  >({
    mutationFn: deleteClub,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-clubs"] });
      toast.success("Clube excluído permanentemente.");
      onOpenChange(false);
    },
    onError: (error) =>
      toast.error(error.message || "Erro ao excluir o clube."),
  });

  const onSubmit: SubmitHandler<any> = (data) => {
    if (!club) return;
    updateClubMutate({ id: club.id, ...data });
  };

  return (
    <Dialog open={openDialog} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] lg:max-w-3xl max-h-[90vh] overflow-y-auto gap-1">
        <DialogHeader>
          <DialogTitle className="text-3xl text-primary">
            Gerenciar Clube
          </DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-2">
          <div className="space-y-4 border-b pb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              Detalhes do Clube
            </h3>
            <div className="grid gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Nome</label>
                <Input
                  {...register("name", { required: true })}
                  placeholder="Nome do clube"
                />
                {errors.name && (
                  <span className="text-xs text-red-500">Obrigatório</span>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Descrição
                </label>
                <Input
                  {...register("description")}
                  placeholder="Descrição do clube"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Código de Convite
                </label>
                <Input {...register("invitationCode")} placeholder="Código" />
              </div>
            </div>
            <div className="flex flex-col w-full mt-2">
              <Button type="submit" disabled={isUpdating} size="sm">
                {isUpdating ? "Salvando..." : "Salvar Dados"}
              </Button>
            </div>
          </div>
        </form>

        <div className="space-y-4 border-b">
          <h3 className="text-lg font-semibold flex items-center">
            Membros ({club?.member?.length || 0})
          </h3>

          <ScrollArea className="pb-4 w-full pr-4">
            <div className="flex flex-col gap-4">
              {club?.member && club.member.length > 0 ? (
                club.member.map((member: IMembersClub) => (
                  <div
                    key={member.user.id}
                    className="flex items-center justify-between p-3 border rounded-md bg-secondary/10"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {member.user.name}{" "}
                        {member.user.id == club.ownerId && "(você)"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {member.user.email}
                      </span>
                      {member.user.status && (
                        <Badge className="mt-2">
                          {userStatusLabels[member.user.status]}
                        </Badge>
                      )}
                    </div>

                    {member.user.id !== club.ownerId && (
                      <AlertDialog>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertDialogTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-500 hover:text-red-700 hover:bg-red-100"
                                >
                                  <UserX size={18} />
                                </Button>
                              </AlertDialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Banir membro</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Banir Membro</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja banir{" "}
                              <span className="font-bold">
                                {member.user.name}
                              </span>
                              ? Ele perderá o acesso ao clube imediatamente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => banMemberMutate(member.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Sim, Banir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum membro encontrado.
                </p>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="pt-2">
          <h3 className="text-sm font-bold text-primary mb-2 uppercase tracking-wider">
            Zona de Perigo
          </h3>
          <div className="flex items-center justify-between p-4 border bg-secondary/10 rounded-md">
            <div className="text-sm text-primary">
              <p className="font-medium">Excluir este clube</p>
              <p className="text-xs">Esta ação não pode ser desfeita.</p>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Excluindo..." : "Excluir Clube"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Você tem certeza absoluta disso?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso excluirá
                    permanentemente o clube{" "}
                    <span className="font-bold">{club?.name}</span> e removerá
                    todos os dados associados a ele dos nossos servidores.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      if (club?.id) deleteClubMutate(club.id);
                    }}
                    className="bg-primary hover:bg-primary/80"
                  >
                    Confirmar Exclusão
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditMyClubDialog;
