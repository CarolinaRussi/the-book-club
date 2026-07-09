export const PASSWORD_MIN_LENGTH = 6;

export class InvalidPasswordFormatError extends Error {
  constructor() {
    super(`A senha deve ter no mínimo ${PASSWORD_MIN_LENGTH} caracteres.`);
    this.name = "InvalidPasswordFormatError";
  }
}

export function assertPasswordMeetsPolicy(password: string): void {
  if (typeof password !== "string" || password.length < PASSWORD_MIN_LENGTH) {
    throw new InvalidPasswordFormatError();
  }
}
