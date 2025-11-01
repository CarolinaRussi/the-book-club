import { useMutation } from "@tanstack/react-query";
import { useForm, type SubmitHandler } from "react-hook-form";
import { GiBookCover } from "react-icons/gi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { IApiError, IApiReturnData } from "../types/IApi";
import { ILoginData } from "../types/ILogin";
import { loginUser } from "../api/mutations/authMutate";

export default function Login() {
  const navigate = useNavigate();
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
      navigate("/home");
    },
    onError: (error) => {
      toast.error(error.message || "Email ou senha incorretos");
    },
  });

  const onSubmit: SubmitHandler<ILoginData> = (data) => {
    const { email, password } = data;

    loginMutate({ email, password });
  };
  return (
    <div className="border-2 text-foreground border-secondary rounded-lg p-6 w-120 h-160 mt-5 shadow-md bg-background flex flex-col items-center justify-center gap-2 text-center">
      <GiBookCover size={100} className="text-primary" />
      <h1 className="text-4xl font-bold text-foreground">Entrar</h1>
      <h2 className="text-warm-brown mb-4">
        Entre com sua conta para acessar o Clube do Livro
      </h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          {...register("email", { required: true })}
          placeholder="Email"
          className="border-2 border-secondary rounded-lg p-2 w-80 mt-4 text-foreground bg-background"
        />
        {errors.email && (
          <h3 className="text-xs text-primary">E-mail é obrigatório</h3>
        )}
        <input
          {...register("password", { required: true, minLength: 6 })}
          type="password"
          placeholder="Senha"
          className="border-2 border-secondary rounded-lg p-2 w-80 mt-4 text-foreground bg-background"
        />
        {errors.password && (
          <h3 className="text-xs text-primary">
            Senha é obrigatória e deve ter no mínimo 6 caracteres
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
          {isPending ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <h3 className="text-warm-brown mt-4">
        Não tem uma conta?{" "}
        <a
          href="/register"
          className="text-primary font-semibold hover:underline"
        >
          Cadastre-se
        </a>
      </h3>
      <a
        href="/"
        className="text-warm-brown mt-2 text-sm hover:text-primary hover:underline"
      >
        Voltar para página inicial
      </a>
    </div>
  );
}
