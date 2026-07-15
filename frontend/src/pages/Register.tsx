import { useMutation } from "@tanstack/react-query";
import { useForm, type SubmitHandler } from "react-hook-form";
import LogoEntrelivros from "@/components/LogoEntrelivros";
import { registerUser } from "../api/mutations/authMutate";
import { toast } from "react-toastify";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import type { IFormInput, IRegisterData } from "../types/IRegister";
import type { IApiError, IApiReturnData } from "../types/IApi";
import {
  confirmPasswordFieldRules,
  passwordFieldRules,
} from "../utils/passwordPolicy";
import { PasswordInput } from "@/components/ui/password-input";
import { redirectSearch, safeRedirect } from "@/utils/safeRedirect";

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = safeRedirect(searchParams.get("redirect"));
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<IFormInput>();
  const password = watch("password");

  const { mutate, isPending } = useMutation<
    IApiReturnData,
    IApiError,
    IRegisterData
  >({
    mutationFn: registerUser,
    onSuccess: (result) => {
      toast.success("Conta criada com sucesso!");
      login(result.token, result.user);
      navigate(redirectPath);
    },
    onError: (error) => toast.error(error.message || "Erro ao criar conta"),
  });

  const onSubmit: SubmitHandler<IFormInput> = (data) => {
    const { confirmPassword, ...rest } = data;
    mutate(rest);
  };

  return (
    <div className="p-8 border-2 text-foreground border-secondary rounded-lg w-120 mt-20 shadow-md bg-background flex flex-col items-center justify-center gap-2 text-center">
      <LogoEntrelivros size={150} className="shrink-0" aria-hidden />
      <h1 className="text-4xl font-bold text-foreground">Criar conta</h1>
      <h2 className="text-warm-brown mb-4 w-80">
        Junte-se ao Entrelivros e comece
        <br />
        sua jornada literária!
      </h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-2 flex w-full max-w-80 flex-col items-center gap-4"
      >
        <div className="w-full space-y-1">
          <input
            {...register("name", { required: true })}
            placeholder="Nome"
            className="w-full rounded-lg border-2 border-secondary bg-background p-2.5 text-foreground"
          />
          {errors.name && (
            <p className="text-left text-xs text-primary">
              Nome de usuário é obrigatório
            </p>
          )}
        </div>
        <div className="w-full space-y-1">
          <input
            {...register("lastName", { required: true })}
            placeholder="Sobrenome"
            className="w-full rounded-lg border-2 border-secondary bg-background p-2.5 text-foreground"
          />
          {errors.lastName && (
            <p className="text-left text-xs text-primary">
              Sobrenome é obrigatório
            </p>
          )}
        </div>
        <div className="w-full space-y-1">
          <input
            {...register("nickname", { required: true })}
            placeholder="Apelido"
            className="w-full rounded-lg border-2 border-secondary bg-background p-2.5 text-foreground"
          />
          {errors.nickname && (
            <p className="text-left text-xs text-primary">Apelido é obrigatório</p>
          )}
        </div>
        <div className="w-full space-y-1">
          <input
            {...register("email", { required: true })}
            placeholder="Email"
            className="w-full rounded-lg border-2 border-secondary bg-background p-2.5 text-foreground"
          />
          {errors.email && (
            <p className="text-left text-xs text-primary">E-mail é obrigatório</p>
          )}
        </div>
        <div className="w-full space-y-1">
          <PasswordInput
            {...register("password", passwordFieldRules())}
            placeholder="Senha"
          />
          {errors.password && (
            <p className="text-left text-xs text-primary">
              {errors.password.message}
            </p>
          )}
        </div>
        <div className="w-full space-y-1">
          <PasswordInput
            {...register(
              "confirmPassword",
              confirmPasswordFieldRules(() => password),
            )}
            placeholder="Confirmar Senha"
          />
          {errors.confirmPassword && (
            <p className="text-left text-xs text-primary">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={isPending}
          className={`mt-2 w-full rounded-lg bg-primary p-2.5 font-semibold text-background transition-colors ${
            isPending
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer hover:bg-foreground"
          }`}
        >
          {isPending ? "Registrando..." : "Registrar"}
        </button>
      </form>
      <h3 className="text-warm-brown mt-4">
        Já tem uma conta?{" "}
        <Link
          to={`/login${redirectSearch(searchParams.get("redirect"))}`}
          className="text-primary font-semibold hover:underline"
        >
          Entrar
        </Link>
      </h3>
      <Link
        to="/"
        className="text-warm-brown mt-2 text-sm hover:text-primary hover:underline"
      >
        Voltar para página inicial
      </Link>
    </div>
  );
}
