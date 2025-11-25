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
import { FaRegCopy, FaCheck } from "react-icons/fa6"; // Ícones para o botão de copiar

interface CreateClubDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateClubDialog = ({ open, onOpenChange }: CreateClubDialogProps) => {
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
    setCopied(false);
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
      queryClient.setQueryData<IClub[]>(["userClubs", user?.id], (oldData) => {
        return oldData ? [...oldData, result.club] : [result.club];
      });
      setSelectedClubId(result.club.id);
      setCreatedCode(result.club.invitation_code);
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
    if (createdCode) {
      navigator.clipboard.writeText(createdCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.info("Código copiado para a área de transferência!");
    }
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
              ? "Compartilhe este código com seus amigos para que entrem no clube."
              : "Preencha as informações do seu clube do livro"}
          </DialogDescription>
        </DialogHeader>

        {createdCode ? (
          <div className="flex flex-col items-center justify-center py-6 gap-6">
            <div className="flex flex-col items-center gap-2 w-full">
              <span className="text-sm text-muted-foreground uppercase tracking-wider">
                Código de Convite
              </span>
              <div
                className="flex items-center gap-3 bg-secondary/20 border border-primary/20 p-4 rounded-xl w-full max-w-sm justify-between cursor-pointer hover:bg-secondary/30 transition-colors"
                onClick={handleCopyCode}
              >
                <code className="text-3xl font-bold text-primary tracking-widest text-center flex-1">
                  {createdCode}
                </code>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyCode();
                  }}
                >
                  {copied ? (
                    <FaCheck className="text-green-600" />
                  ) : (
                    <FaRegCopy />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Clique no código para copiar
              </p>
            </div>

            <DialogFooter className="w-full sm:justify-center">
              <Button
                onClick={handleClose}
                className="w-full sm:w-1/2 py-6 text-lg"
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
                  className="border-2 border-secondary rounded-lg p-2 w-full text-foreground bg-background"
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
                  className="border-2 border-secondary rounded-lg p-2 w-full h-40 text-foreground bg-background"
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
