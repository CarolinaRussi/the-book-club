import { type Request, type Response } from "express";
import { requestPasswordReset } from "../../services/passwordResetService";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const forgotPassword = async (req: Request, res: Response) => {
  const email = typeof req.body?.email === "string" ? req.body.email : "";

  if (!email.trim()) {
    res.status(400).json({ message: "Informe seu e-mail." });
    return;
  }

  if (!EMAIL_PATTERN.test(email.trim())) {
    res.status(400).json({ message: "Informe um e-mail válido." });
    return;
  }

  try {
    const result = await requestPasswordReset(email);
    res.status(200).json(result);
  } catch (error) {
    console.error("Erro ao solicitar reset de senha:", error);
    res.status(500).json({ message: "Erro ao processar solicitação." });
  }
};
