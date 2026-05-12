import type { Request, Response } from "express";
import { disconnectGoogleOAuth } from "../../services/googleOAuthService";

export const deleteGoogleOAuth = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ message: "Não autorizado" });
  }

  await disconnectGoogleOAuth(userId);
  return res.status(200).json({
    message: "Google Calendar desligado desta conta.",
    googleConnected: false,
    googleAccountEmail: null,
  });
};
