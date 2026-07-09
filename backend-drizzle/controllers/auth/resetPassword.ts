import { type Request, type Response } from "express";
import {
  InvalidResetTokenError,
  resetPassword,
} from "../../services/passwordResetService";
import { InvalidPasswordFormatError } from "../../utils/passwordPolicy";

export const resetPasswordHandler = async (req: Request, res: Response) => {
  const token = typeof req.body?.token === "string" ? req.body.token : "";
  const password =
    typeof req.body?.password === "string" ? req.body.password : "";

  if (!token.trim()) {
    res.status(400).json({ message: "Link inválido." });
    return;
  }

  if (!password) {
    res.status(400).json({ message: "Informe a nova senha." });
    return;
  }

  try {
    const result = await resetPassword(token, password);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof InvalidPasswordFormatError) {
      return res.status(400).json({ message: error.message });
    }
    if (error instanceof InvalidResetTokenError) {
      return res.status(400).json({ message: error.message });
    }
    console.error("Erro ao redefinir senha:", error);
    res.status(500).json({ message: "Erro ao redefinir senha." });
  }
};
