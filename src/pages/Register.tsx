import { useMutation } from "@tanstack/react-query";
import { useForm, type SubmitHandler } from "react-hook-form";
import { GiBookCover } from "react-icons/gi";
import { registerUser } from "../api/mutations/registerUser";
import { toast } from "react-toastify";

interface IFormInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>();

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => toast.success("Conta criada com sucesso!"),
    onError: () => toast.error("Erro ao criar conta!"),
  });

  const onSubmit: SubmitHandler<IFormInput> = (data) => {
    const { name, email, password, confirmPassword } = data;
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    mutation.mutate({ name, email, password });
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
            {...register("confirmPassword", { required: true, minLength: 6 })}
            type="password"
            placeholder="Confirmar Senha"
            className="border-2 border-secondary rounded-lg p-2 w-80 mt-4 text-foreground bg-background"
          />
          {errors.confirmPassword && (
            <h3 className="text-xs text-primary">
              Senha é obrigatória e deve ter no mínimo 6 caracteres
            </h3>
          )}
          <button
            type="submit"
            className="bg-primary text-background font-semibold rounded-lg p-2 w-80 mt-6 hover:bg-foreground cursor-pointer transition-colors"
          >
            Registrar
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
