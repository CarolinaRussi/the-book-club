import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm, type SubmitHandler } from "react-hook-form";
import LogoEntrelivros from "@/components/LogoEntrelivros";
import { Link } from "react-router";
import { toast } from "react-toastify";
import { forgotPassword } from "@/api/mutations/authMutate";
import type { IApiError } from "@/types/IApi";
import type { IForgotPasswordData } from "@/types/IPasswordReset";

export default function ForgotPassword() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IForgotPasswordData>();

  const { mutate, isPending } = useMutation<
    { message: string },
    IApiError,
    IForgotPasswordData
  >({
    mutationFn: forgotPassword,
    onSuccess: (result) => {
      setSuccessMessage(result.message);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar solicitação");
    },
  });

  const onSubmit: SubmitHandler<IForgotPasswordData> = (data) => {
    mutate({ email: data.email.trim() });
  };

  return (
    <div className="border-2 text-foreground border-secondary rounded-lg p-6 w-120 min-h-160 mt-20 shadow-md bg-background flex flex-col items-center justify-center gap-2 text-center">
      <LogoEntrelivros size={150} className="shrink-0" aria-hidden />
      <h1 className="text-4xl font-bold text-foreground">Esqueci a senha</h1>
      <h2 className="text-warm-brown mb-4 w-80">
        Informe o e-mail da sua conta. Se existir, enviaremos um link para criar
        uma nova senha.
      </h2>

      {successMessage ? (
        <div className="w-80 space-y-4 text-center">
          <p className="rounded-lg border border-secondary bg-secondary/20 p-4 text-sm text-foreground">
            {successMessage}
          </p>
          <Link
            to="/login"
            className="inline-block text-sm text-center font-semibold text-primary hover:underline"
          >
            Voltar para entrar
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <input
            {...register("email", { required: true })}
            type="email"
            placeholder="E-mail"
            className="border-2 border-secondary rounded-lg p-2 w-80 mt-4 text-foreground bg-background"
          />
          {errors.email && (
            <h3 className="text-xs text-primary">E-mail é obrigatório</h3>
          )}
          <button
            type="submit"
            disabled={isPending}
            className={`bg-primary text-background font-semibold rounded-lg p-2 w-80 mt-6 transition-colors ${
              isPending
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-foreground cursor-pointer"
            }`}
          >
            {isPending ? "Enviando..." : "Enviar link"}
          </button>
        </form>
      )}

      {!successMessage && (
        <Link
          to="/login"
          className="text-warm-brown mt-4 text-sm hover:text-primary hover:underline"
        >
          Voltar para entrar
        </Link>
      )}
    </div>
  );
}
