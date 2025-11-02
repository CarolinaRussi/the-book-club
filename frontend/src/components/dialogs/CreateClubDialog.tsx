import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { IClubData } from "../../types/IClubs";
import { IApiError } from "../../types/IApi";
import { useMutation } from "@tanstack/react-query";
import { createClub } from "../../api/mutations/clubMutate";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useAuth } from "../../contexts/AuthContext";
import { useClub } from "../../contexts/ClubContext";

interface CreateClubDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateClubDialog = ({ open, onOpenChange }: CreateClubDialogProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IClubData>();
  const { user } = useAuth();
  const { setSelectedClubId } = useClub();

  const { mutate: createClubMutate } = useMutation<any, IApiError, IClubData>({
    mutationFn: createClub,
    onSuccess: async (result) => {
      console.log(result);
      setSelectedClubId(result.club.id);
      toast.success("Clube criado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Email ou senha incorretos");
    },
  });

  const onSubmit: SubmitHandler<IClubData> = (data) => {
    const { name, description, invitationCode } = data;
    const ownerId = user?.id;

    createClubMutate({ name, description, invitationCode, ownerId });
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] lg:max-w-2xl">
        <DialogHeader className="gap-0">
          <DialogTitle className="text-3xl text-primary">
            Criar Novo Clube
          </DialogTitle>
          <DialogDescription className="text-1xl text-warm-brown">
            Preencha as informações do seu clube do livro
          </DialogDescription>
        </DialogHeader>
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
                  Deixe as leitoras saberem mais sobre o clube
                </h3>
              )}
            </div>
            <div className="grid gap-1">
              <label htmlFor="inviteCode" className="text-warm-brown">
                Código de Convite:
              </label>
              <input
                {...register("invitationCode", { required: true })}
                placeholder="Ex.: CLASSICO2025"
                className="border-2 border-secondary rounded-lg p-2 w-full text-foreground bg-background"
              />
              {errors.invitationCode && (
                <h3 className="text-xs text-primary">
                  Informe um código para poder convidar as leitoras para o seu
                  clube
                </h3>
              )}
            </div>
          </div>
          <DialogFooter className=" mt-5 ">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Criar Clube</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateClubDialog;
