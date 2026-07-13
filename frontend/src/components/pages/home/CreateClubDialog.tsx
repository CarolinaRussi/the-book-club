import { type SubmitHandler, useForm } from "react-hook-form";
import type { IClub, IClubPayload } from "../../../types/IClubs";
import type { IApiError } from "../../../types/IApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClub } from "../../../api/mutations/clubMutate";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { useAuth } from "../../../contexts/AuthContext";
import { useClub } from "../../../contexts/ClubContext";
import { useState } from "react";
import { FaRegCopy, FaCheck } from "react-icons/fa6";
import { buildInviteUrl } from "@/utils/inviteUrl";

interface CreateClubDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateClubDialog = ({ open, onOpenChange }: CreateClubDialogProps) => {
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<IClubPayload>();

  const { user } = useAuth();
  const { setSelectedClubId } = useClub();
  const queryClient = useQueryClient();

  const handleClose = () => {
    setCreatedCode(null);
    setCopiedCode(false);
    setCopiedLink(false);
    reset();
    onOpenChange(false);
  };

  const { mutate: createClubMutate } = useMutation<
    { club: IClub },
    IApiError,
    IClubPayload
  >({
    mutationFn: createClub,
    onSuccess: async (result) => {
      setCreatedCode(result.club.invitationCode);
      setSelectedClubId(result.club.id);

      toast.success("Clube criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["userClubs", user?.id] });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar clube");
    },
  });

  const onSubmit: SubmitHandler<IClubPayload> = (data) => {
    const { name, description } = data;
    const ownerId = user?.id;
    createClubMutate({ name, description, ownerId });
  };

  const handleCopyCode = () => {
    if (!createdCode) return;
    navigator.clipboard.writeText(createdCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    toast.info("Código copiado para a área de transferência!");
  };

  const handleCopyLink = () => {
    if (!createdCode) return;
    navigator.clipboard.writeText(buildInviteUrl(createdCode));
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    toast.info("Link de convite copiado!");
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[425px] lg:max-w-2xl">
        <DialogHeader className="gap-0">
          <DialogTitle className="text-3xl text-primary">
            {createdCode ? "Clube Criado!" : "Criar Novo Clube"}
          </DialogTitle>
          <DialogDescription className="text-1xl text-warm-brown">
            {createdCode
              ? "Compartilhe o link ou o código para que entrem no clube."
              : "Preencha as informações do seu clube do livro"}
          </DialogDescription>
        </DialogHeader>

        {createdCode ? (
          <div className="flex flex-col items-center justify-center gap-6 py-6">
            <div className="flex w-full flex-col items-center gap-2">
              <span className="text-sm uppercase tracking-wider text-muted-foreground">
                Código de Convite
              </span>
              <div
                className="flex w-full max-w-sm cursor-pointer items-center justify-between gap-3 rounded-xl border border-primary/20 bg-secondary/20 p-4 transition-colors hover:bg-secondary/30"
                onClick={handleCopyCode}
              >
                <code className="flex-1 text-center text-3xl font-bold tracking-widest text-primary">
                  {createdCode}
                </code>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleCopyCode();
                  }}
                >
                  {copiedCode ? (
                    <FaCheck className="text-green-600" />
                  ) : (
                    <FaRegCopy />
                  )}
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Clique no código para copiar
              </p>
            </div>

            <div className="flex w-full max-w-sm flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleCopyLink}
              >
                {copiedLink ? (
                  <>
                    <FaCheck className="text-green-600" />
                    Link copiado
                  </>
                ) : (
                  <>
                    <FaRegCopy />
                    Copiar link de convite
                  </>
                )}
              </Button>
            </div>

            <DialogFooter className="w-full sm:justify-center">
              <Button
                onClick={handleClose}
                className="w-full py-6 text-base sm:w-1/2 md:text-lg"
              >
                Fechar e Ir para o Clube
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-3">
              <div className="grid gap-2">
                <label htmlFor="name" className="text-warm-brown">
                  Nome do Clube:
                </label>
                <input
                  {...register("name", { required: true })}
                  placeholder="Ex.: Clube dos Clássicos"
                  className="w-full rounded-lg border-2 border-secondary bg-background p-2 text-foreground"
                />
                {errors.name && (
                  <h3 className="text-xs text-primary">
                    Um clube precisa de um nome!
                  </h3>
                )}
              </div>
              <div className="grid gap-1">
                <label htmlFor="description" className="text-warm-brown">
                  Descrição:
                </label>
                <textarea
                  {...register("description", { required: true })}
                  placeholder="Descreva o objetivo e tema do clube"
                  className="h-40 w-full rounded-lg border-2 border-secondary bg-background p-2 text-foreground"
                />
                {errors.description && (
                  <h3 className="text-xs text-primary">
                    Deixe os leitores saberem mais sobre o clube
                  </h3>
                )}
              </div>
            </div>
            <DialogFooter className=" mt-5 ">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit">Criar Clube</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateClubDialog;
