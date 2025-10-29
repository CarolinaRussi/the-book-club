import { useMutation } from "@tanstack/react-query";
import { useForm, type SubmitHandler } from "react-hook-form";
import { GiBookCover } from "react-icons/gi";
import { registerUser } from "../api/mutations/registerUser";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { IFormInput, IRegisterData } from "../types/IRegister";
import { IApiError, IApiReturnData } from "../types/IApi";

export default function Register() {
  const navigate = useNavigate();
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
      login(result.token, result.id, result.name);
      navigate("/home");
    },
    onError: (error) => toast.error(error.message || "Erro ao criar conta"),
  });

  const onSubmit: SubmitHandler<IFormInput> = (data) => {
    const { name, email, password } = data;
    mutate({ name, email, password });
  };

  return (
    <div className="bg-background flex flex-col items-center justify-start gap-4 min-h-screen p-20">
      <div className="border-2 text-foreground border-secondary rounded-lg p-6 w-120 h-160 mt-5 shadow-md bg-background flex flex-col items-center justify-center gap-2 text-center">
        <GiBookCover size={100} className="text-primary" />
        <h1 className="text-4xl font-bold text-foreground">Criar conta</h1>
        <h2 className="text-warm-brown mb-4 w-80">
          Junte-se ao Clube do Livro e comece sua jornada literária!
        </h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input
            {...register("name", { required: true })}
            placeholder="Nome"
            className="border-2 border-secondary rounded-lg p-2 w-80 mt-4 text-foreground bg-background"
          />
          {errors.name && (
            <h3 className="text-xs text-primary">
              Nome de usuário obrigatório
            </h3>
          )}
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
          <input
            {...register("confirmPassword", {
              required: true,
              validate: (value) =>
                value === password || "As senhas não coincidem",
            })}
            type="password"
            placeholder="Confirmar Senha"
            className="border-2 border-secondary rounded-lg p-2 w-80 mt-4 text-foreground bg-background"
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
          <a
            href="/login"
            className="text-primary font-semibold hover:underline"
          >
            Entrar
          </a>
        </h3>
        <a
          href="/"
          className="text-warm-brown mt-2 text-sm hover:text-primary hover:underline"
        >
          Voltar para página inicial
        </a>
      </div>
    </div>
  );
}
