import { Link } from "react-router";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { updateUser } from "@/api/mutations/userMutate";
import type { IApiError } from "@/types/IApi";
import type { IUser, IUserUpdateForm } from "@/types/IUser";
import Settings from "@/components/pages/me/Settings";
import ChangePassword from "@/components/pages/me/profile/ChangePassword";
import GoogleCalendarProfileSection from "@/components/pages/me/profile/GoogleCalendarProfileSection";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Account() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<IUserUpdateForm>();

  const password = watch("password");
  const isChangingPassword =
    !!watch("oldPassword") || !!watch("password") || !!watch("confirmPassword");

  const { mutate: updateUserMutate, isPending } = useMutation<
    { message: string; user: IUser },
    IApiError,
    FormData
  >({
    mutationFn: updateUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["authenticatedUser"] });
      toast.success("Senha atualizada com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar a senha");
    },
  });

  const onSubmit: SubmitHandler<IUserUpdateForm> = (data) => {
    if (!user || !isChangingPassword) return;

    const formData = new FormData();
    formData.append("id", user.id);
    formData.append("oldPassword", data.oldPassword ?? "");
    formData.append("password", data.password ?? "");
    updateUserMutate(formData);
  };

  if (!user) return null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-5 md:py-12">
      <Link
        to="/me"
        className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar ao perfil
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-foreground">Conta</h1>
        <p className="mt-2 text-muted-foreground">
          Configurações privadas — não aparecem no seu perfil público.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>E-mail</CardTitle>
          <CardDescription>
            Usado para login. Alteração de e-mail ainda não está disponível na
            interface.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-foreground">{user.email}</p>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <ChangePassword
          register={register}
          errors={errors}
          isChangingPassword={isChangingPassword}
          password={password}
        />
        {isChangingPassword ? (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              {isPending ? "Salvando..." : "Salvar nova senha"}
            </button>
          </div>
        ) : null}
      </form>

      <GoogleCalendarProfileSection />

      <Settings />
    </div>
  );
}
