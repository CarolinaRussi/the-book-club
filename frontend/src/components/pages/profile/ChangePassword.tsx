import type { UseFormRegister } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import type { IUserUpdateForm } from "@//types/IUser";

interface ChangePasswordProps {
  register: UseFormRegister<IUserUpdateForm>;
  errors: any;
  isChangingPassword: boolean;
  password: string | undefined;
}

const ChangePassword = ({
  register,
  errors,
  isChangingPassword,
  password,
}: ChangePasswordProps) => {
  return (
    <Card className="md:col-span-3">
      <CardHeader>
        <CardTitle>Alterar Senha</CardTitle>
        <CardDescription>Deixe em branco se não quiser alterar</CardDescription>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="flex flex-col gap-2 w-full">
              <div>Senha atual:</div>
              <input
                type="password"
                {...register("oldPassword", {
                  required: isChangingPassword
                    ? "Senha atual é obrigatória"
                    : false,
                })}
                autoComplete="new-password"
                className="border-2 border-secondary rounded-lg p-2 w-full text-foreground bg-background"
              />
              {errors.oldPassword && (
                <h3 className="text-xs text-primary">
                  {errors.oldPassword.message}
                </h3>
              )}
            </div>
            <div className="flex flex-col gap-2 w-full">
              <div>Nova Senha:</div>
              <input
                type="password"
                {...register("password", {
                  required: isChangingPassword
                    ? "Nova senha é obrigatória"
                    : false,
                })}
                className="border-2 border-secondary rounded-lg p-2 w-full text-foreground bg-background"
              />
              {errors.password && (
                <h3 className="text-xs text-primary">
                  {errors.password.message}
                </h3>
              )}
            </div>
            <div className="flex flex-col gap-2 w-full">
              <div>Confirmar Nova Senha:</div>
              <input
                type="password"
                {...register("confirmPassword", {
                  required: isChangingPassword
                    ? "Confirmação é obrigatória"
                    : false,
                  validate: (value) =>
                    !isChangingPassword ||
                    value === password ||
                    "As senhas não coincidem",
                })}
                className="border-2 border-secondary rounded-lg p-2 w-full text-foreground bg-background"
              />
              {errors.confirmPassword && (
                <h3 className="text-xs text-primary">
                  {errors.confirmPassword.message}
                </h3>
              )}
            </div>
          </div>
        </CardContent>
      </CardHeader>
    </Card>
  );
};

export default ChangePassword;
