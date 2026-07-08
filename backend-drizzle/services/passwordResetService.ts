import bcrypt from "bcryptjs";
import { UserStatus } from "../enums/userStatus";
import {
  generatePasswordResetToken,
  hashPasswordResetToken,
} from "../utils/passwordResetToken";
import { getFrontendUrl } from "../utils/emailConfig";
import { sendPasswordResetEmail } from "./emailService";
import * as userRepository from "../repositories/userRepository";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export class InvalidResetTokenError extends Error {
  constructor() {
    super("Link inválido ou expirado. Solicite um novo reset de senha.");
    this.name = "InvalidResetTokenError";
  }
}

export function buildForgotPasswordMessage(email: string): string {
  return `Se existir uma conta com o e-mail ${email}, você receberá um link para criar uma nova senha.`;
}

export async function requestPasswordReset(
  email: string,
): Promise<{ message: string }> {
  const displayEmail = email.trim();
  const foundUser = await userRepository.findUserByEmail(displayEmail);

  if (foundUser && foundUser.status === UserStatus.ACTIVE) {
    const token = generatePasswordResetToken();
    const tokenHash = hashPasswordResetToken(token);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await userRepository.setUserPasswordReset(
      foundUser.id,
      tokenHash,
      expiresAt,
    );

    const resetUrl = `${getFrontendUrl()}/reset-password?token=${encodeURIComponent(token)}`;

    try {
      await sendPasswordResetEmail(foundUser.email, resetUrl);
    } catch (error) {
      console.error("Erro ao enviar e-mail de reset de senha:", error);
    }
  }

  return { message: buildForgotPasswordMessage(displayEmail) };
}

export async function resetPassword(
  token: string,
  password: string,
): Promise<{ message: string }> {
  const tokenHash = hashPasswordResetToken(token.trim());
  const foundUser =
    await userRepository.findUserByPasswordResetTokenHash(tokenHash);

  if (
    !foundUser ||
    !foundUser.passwordResetExpiresAt ||
    foundUser.passwordResetExpiresAt < new Date() ||
    foundUser.status !== UserStatus.ACTIVE
  ) {
    throw new InvalidResetTokenError();
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const updated = await userRepository.updateUserPassword(
    foundUser.id,
    hashedPassword,
  );

  if (!updated) {
    throw new Error("update_password_failed");
  }

  return { message: "Senha atualizada com sucesso! Você já pode entrar." };
}
