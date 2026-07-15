import { useMutation } from "@tanstack/react-query";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";
import { useNavigate, Link, useSearchParams } from "react-router";
import LogoEntrelivros from "@/components/LogoEntrelivros";
import { useAuth } from "../contexts/AuthContext";
import type { IApiError, IApiReturnData } from "../types/IApi";
import type { ILoginData } from "../types/ILogin";
import { loginUser } from "../api/mutations/authMutate";
import {
  PASSWORD_MIN_LENGTH,
  passwordMinLengthMessage,
  passwordRequiredMessage,
} from "../utils/passwordPolicy";
import { PasswordInput } from "@/components/ui/password-input";
import { redirectSearch, safeRedirect } from "@/utils/safeRedirect";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = safeRedirect(searchParams.get("redirect"));
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ILoginData>();

  const { mutate: loginMutate, isPending } = useMutation<
    IApiReturnData,
    IApiError,
    ILoginData
  >({
    mutationFn: loginUser,
    onSuccess: async (result) => {
      toast.success("Login efetuado com sucesso!");
      login(result.token, result.user);
      navigate(redirectPath);
    },
    onError: (error) => {
      toast.error(error.message || "Email ou senha incorretos");
    },
  });

  const onSubmit: SubmitHandler<ILoginData> = (data) => {
    loginMutate({ email: data.email, password: data.password });
  };

  return (
    <div className="mt-20 flex w-120 flex-col items-center rounded-lg border-2 border-secondary bg-background p-8 text-center text-foreground shadow-md">
      <LogoEntrelivros size={150} className="shrink-0" aria-hidden />
      <h1 className="mt-4 text-3xl font-bold">Entrar</h1>
      <p className="mt-1 text-sm text-warm-brown">Entre com sua conta para acessar o Entrelivros</p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 flex w-full max-w-80 flex-col items-center gap-4"
      >
        <div className="w-full space-y-1">
          <input
            {...register("email", { required: true })}
            type="email"
            placeholder="E-mail"
            className="w-full rounded-lg border-2 border-secondary bg-background p-2.5 text-foreground"
          />
          {errors.email && (
            <p className="text-left text-xs text-primary">E-mail é obrigatório</p>
          )}
        </div>

        <div className="w-full space-y-1">
          <PasswordInput
            {...register("password", { required: true, minLength: PASSWORD_MIN_LENGTH })}
            placeholder="Senha"
          />
          {errors.password && (
            <p className="text-left text-xs text-primary">
              {errors.password.type === "minLength"
                ? passwordMinLengthMessage
                : passwordRequiredMessage}
            </p>
          )}
          <Link
            to="/forgot-password"
            className="block pt-1 text-right text-xs text-warm-brown transition-colors hover:text-primary"
          >
            Esqueci minha senha
          </Link>
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
          {isPending ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="mt-6 text-sm text-warm-brown">
        Não tem uma conta?{" "}
        <Link
          to={`/register${redirectSearch(searchParams.get("redirect"))}`}
          className="font-semibold text-primary hover:underline"
        >
          Cadastre-se
        </Link>
      </p>
      <Link
        to="/"
        className="mt-3 text-xs text-warm-brown/80 transition-colors hover:text-primary"
      >
        Voltar para página inicial
      </Link>
    </div>
  );
}
