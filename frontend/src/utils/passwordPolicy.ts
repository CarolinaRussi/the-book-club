export const PASSWORD_MIN_LENGTH = 6;

export const passwordRequiredMessage = "Senha é obrigatória";

export const passwordMinLengthMessage = `A senha deve ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres`;

export const confirmPasswordRequiredMessage = "Confirme a senha";

export const passwordsMustMatchMessage = "As senhas não coincidem";

export function passwordFieldRules(options?: { required?: boolean | string }) {
  const required = options?.required ?? passwordRequiredMessage;
  return {
    required,
    minLength: {
      value: PASSWORD_MIN_LENGTH,
      message: passwordMinLengthMessage,
    },
  };
}

export function confirmPasswordFieldRules(
  getPassword: () => string | undefined,
  options?: { required?: boolean | string },
) {
  const required = options?.required ?? confirmPasswordRequiredMessage;
  return {
    required,
    validate: (value: string) =>
      value === getPassword() || passwordsMustMatchMessage,
  };
}
