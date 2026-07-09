import type { UseFormRegister } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../ui/card";
import type { IUserUpdateForm } from "@//types/IUser";
import {
  confirmPasswordFieldRules,
  passwordFieldRules,
} from "@/utils/passwordPolicy";
import { PasswordInput } from "@/components/ui/password-input";

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
              <PasswordInput
                {...register("oldPassword", {
                  required: isChangingPassword
                    ? "Senha atual é obrigatória"
                    : false,
                })}
                autoComplete="new-password"
                className="p-2"
              />
              {errors.oldPassword && (
                <h3 className="text-xs text-primary">
                  {errors.oldPassword.message}
                </h3>
              )}
            </div>
            <div className="flex flex-col gap-2 w-full">
              <div>Nova Senha:</div>
              <PasswordInput
                {...register(
                  "password",
                  passwordFieldRules({
                    required: isChangingPassword
                      ? "Nova senha é obrigatória"
                      : false,
                  }),
                )}
                className="p-2"
              />
              {errors.password && (
                <h3 className="text-xs text-primary">
                  {errors.password.message}
                </h3>
              )}
            </div>
            <div className="flex flex-col gap-2 w-full">
              <div>Confirmar Nova Senha:</div>
              <PasswordInput
                {...register(
                  "confirmPassword",
                  confirmPasswordFieldRules(() => password, {
                    required: isChangingPassword
                      ? "Confirmação é obrigatória"
                      : false,
                  }),
                )}
                className="p-2"
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
