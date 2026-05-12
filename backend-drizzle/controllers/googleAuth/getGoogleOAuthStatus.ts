import type { Request, Response } from "express";
import { getGoogleOAuthStatus } from "../../services/googleOAuthService";

export const getGoogleOAuthStatusHandler = async (
  req: Request,
  res: Response,
) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ message: "Não autorizado" });
  }

  const status = await getGoogleOAuthStatus(userId);
  return res.status(200).json(status);
};
