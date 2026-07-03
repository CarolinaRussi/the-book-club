import { Request, Response } from "express";
import { ReadingStatus } from "../../enums/readingStatus";
import * as userProfileService from "../../services/userProfileService";

const ALLOWED_READING_STATUS = new Set<string>(Object.values(ReadingStatus));

export const getUserReadings = async (req: Request, res: Response) => {
  const viewerUserId = req.userId;
  const { userId: targetUserId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 15;
  const statusParam = (req.query.status as string) || ReadingStatus.FINISHED;

  if (!viewerUserId) {
    return res.status(401).json({ message: "Usuário não autenticado." });
  }

  if (!targetUserId) {
    return res.status(400).json({ message: "Usuária não informada." });
  }

  if (!ALLOWED_READING_STATUS.has(statusParam)) {
    return res.status(400).json({ message: "Status de leitura inválido." });
  }

  try {
    const payload = await userProfileService.getUserReadingsPaginated(
      viewerUserId,
      targetUserId,
      page,
      limit,
      statusParam as ReadingStatus,
    );
    return res.status(200).json(payload);
  } catch (error) {
    if (error instanceof userProfileService.UserProfileNotFoundError) {
      return res.status(404).json({ message: error.message });
    }
    if (error instanceof userProfileService.UserProfileForbiddenError) {
      return res.status(403).json({ message: error.message });
    }
    console.error("Erro ao buscar leituras do perfil:", error);
    return res
      .status(500)
      .json({ message: "Erro interno ao buscar leituras do perfil." });
  }
};
