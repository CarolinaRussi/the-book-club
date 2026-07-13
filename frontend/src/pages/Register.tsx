import { useMutation } from "@tanstack/react-query";
import { useForm, type SubmitHandler } from "react-hook-form";
import { GiBookCover } from "react-icons/gi";
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
      <GiBookCover size={100} className="text-primary" />
      <h1 className="text-4xl font-bold text-foreground">Criar conta</h1>
      <h2 className="text-warm-brown mb-4 w-80">
        Junte-se ao Entrelivros e comece sua jornada literária!
      </h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          {...register("name", { required: true })}
          placeholder="Nome"
          className="border-2 border-secondary rounded-lg p-2 w-80 mt-4 text-foreground bg-background"
        />
        {errors.name && (
          <h3 className="text-xs text-primary">
            Nome de usuário é obrigatório
          </h3>
        )}
        <input
          {...register("lastName", { required: true })}
          placeholder="Sobrenome"
          className="border-2 border-secondary rounded-lg p-2 w-80 mt-4 text-foreground bg-background"
        />
        {errors.lastName && (
          <h3 className="text-xs text-primary">Sobrenome é obrigatório</h3>
        )}
        <input
          {...register("nickname", { required: true })}
          placeholder="Apelido"
          className="border-2 border-secondary rounded-lg p-2 w-80 mt-4 text-foreground bg-background"
        />
        {errors.lastName && (
          <h3 className="text-xs text-primary">Apelido é obrigatório</h3>
        )}
        <input
          {...register("email", { required: true })}
          placeholder="Email"
          className="border-2 border-secondary rounded-lg p-2 w-80 mt-4 text-foreground bg-background"
        />
        {errors.email && (
          <h3 className="text-xs text-primary">E-mail é obrigatório</h3>
        )}
        <PasswordInput
          {...register("password", passwordFieldRules())}
          placeholder="Senha"
          containerClassName="mt-4 w-80"
        />
        {errors.password && (
          <h3 className="text-xs text-primary">{errors.password.message}</h3>
        )}
        <PasswordInput
          {...register(
            "confirmPassword",
            confirmPasswordFieldRules(() => password),
          )}
          placeholder="Confirmar Senha"
          containerClassName="mt-4 w-80"
        />
        {errors.confirmPassword && (
          <h3 className="text-xs text-primary">
            {errors.confirmPassword.message}
          </h3>
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
