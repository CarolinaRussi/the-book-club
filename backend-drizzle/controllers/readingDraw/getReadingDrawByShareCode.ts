import { Request, Response } from "express";
import {
  getReadingDrawByShareCode,
  ReadingDrawForbiddenError,
  ReadingDrawNotFoundError,
} from "../../services/readingDrawService";

export const getReadingDrawByShareCodeHandler = async (
  req: Request,
  res: Response,
) => {
  const viewerUserId = req.userId;
  const { shareCode } = req.params;

  if (!viewerUserId || !shareCode) {
    return res.status(400).json({ message: "Dados inválidos." });
  }

  try {
    const readingDraw = await getReadingDrawByShareCode(
      shareCode,
      viewerUserId,
    );
    return res.status(200).json({ readingDraw });
  } catch (error) {
    if (error instanceof ReadingDrawNotFoundError) {
      return res.status(404).json({ message: error.message });
    }
    if (error instanceof ReadingDrawForbiddenError) {
      return res.status(403).json({ message: error.message });
    }
    console.error(error);
    return res.status(500).json({ message: "Erro ao buscar sorteio." });
  }
};
