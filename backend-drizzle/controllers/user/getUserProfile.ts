import { Request, Response } from "express";
import * as userProfileService from "../../services/userProfileService";

export const getUserProfile = async (req: Request, res: Response) => {
  const viewerUserId = req.userId;
  const { userId: targetUserId } = req.params;

  if (!viewerUserId) {
    return res.status(401).json({ message: "Usuário não autenticado." });
  }

  if (!targetUserId) {
    return res.status(400).json({ message: "Usuária não informada." });
  }

  try {
    const payload = await userProfileService.getUserProfile(
      viewerUserId,
      targetUserId,
    );
    return res.status(200).json(payload);
  } catch (error) {
    if (error instanceof userProfileService.UserProfileNotFoundError) {
      return res.status(404).json({ message: error.message });
    }
    if (error instanceof userProfileService.UserProfileForbiddenError) {
      return res.status(403).json({ message: error.message });
    }
    console.error("Erro ao buscar perfil:", error);
    return res.status(500).json({ message: "Erro interno ao buscar perfil." });
  }
};
