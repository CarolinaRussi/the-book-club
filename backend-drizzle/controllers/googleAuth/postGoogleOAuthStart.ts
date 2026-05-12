import type { Request, Response } from "express";
import {
  GoogleOAuthConfigError,
  startGoogleOAuth,
} from "../../services/googleOAuthService";

export const postGoogleOAuthStart = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ message: "Não autorizado" });
  }

  try {
    const redirectUrl = await startGoogleOAuth(userId);
    return res.status(200).json({
      message: "Redirecione o utilizador para redirectUrl",
      redirectUrl,
    });
  } catch (error) {
    if (error instanceof GoogleOAuthConfigError) {
      return res.status(503).json({ message: error.message });
    }
    console.error(error);
    return res.status(500).json({ message: "Erro ao iniciar ligação Google" });
  }
};
