import { useForm, type SubmitHandler } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { GiBookCover } from "react-icons/gi";
import { Link, useNavigate, useSearchParams } from "react-router";
import { toast } from "react-toastify";
import { resetPassword } from "@/api/mutations/authMutate";
import type { IApiError } from "@/types/IApi";
import {
  confirmPasswordFieldRules,
  passwordFieldRules,
} from "@/utils/passwordPolicy";
import { PasswordInput } from "@/components/ui/password-input";

type ResetPasswordForm = {
  password: string;
  confirmPassword: string;
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>();

  const password = watch("password");

  const { mutate, isPending } = useMutation<
    { message: string },
    IApiError,
    string
  >({
    mutationFn: (newPassword) => resetPassword({ token, password: newPassword }),
    onSuccess: (result) => {
      toast.success(result.message);
      navigate("/login");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao redefinir senha");
    },
  });

  const onSubmit: SubmitHandler<ResetPasswordForm> = (data) => {
    mutate(data.password);
  };

  if (!token) {
    return (
      <div className="border-2 text-foreground border-secondary rounded-lg p-6 w-120 min-h-160 mt-20 shadow-md bg-background flex flex-col items-center justify-center gap-4 text-center">
        <GiBookCover size={100} className="text-primary" />
        <h1 className="text-3xl font-bold text-foreground">Link inválido</h1>
        <p className="text-warm-brown w-80">
          Este link de redefinição de senha não é válido. Solicite um novo na
          página de recuperação.
        </p>
        <Link
          to="/forgot-password"
          className="text-primary font-semibold hover:underline"
        >
          Esqueci a senha
        </Link>
      </div>
    );
  }

  return (
    <div className="border-2 text-foreground border-secondary rounded-lg p-6 w-120 min-h-160 mt-20 shadow-md bg-background flex flex-col items-center justify-center gap-2 text-center">
      <GiBookCover size={100} className="text-primary" />
      <h1 className="text-4xl font-bold text-foreground">Nova senha</h1>
      <h2 className="text-warm-brown mb-4 w-80">
        Crie uma nova senha para acessar o Entrelivros.
      </h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <PasswordInput
          {...register("password", passwordFieldRules())}
          placeholder="Nova senha"
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
          placeholder="Confirmar nova senha"
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
          {isPending ? "Salvando..." : "Salvar nova senha"}
        </button>
      </form>
      <Link
        to="/login"
        className="text-warm-brown mt-4 text-sm hover:text-primary hover:underline"
      >
        Voltar para entrar
      </Link>
    </div>
  );
}
