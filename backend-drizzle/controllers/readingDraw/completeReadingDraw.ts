import { Request, Response } from "express";
import {
  completeReadingDraw,
  ReadingDrawForbiddenError,
  ReadingDrawNotFoundError,
  ReadingDrawValidationError,
} from "../../services/readingDrawService";

export const completeReadingDrawHandler = async (
  req: Request,
  res: Response,
) => {
  const hostUserId = req.userId;
  const { id } = req.params;
  const clubBookId = req.body.clubBookId ?? req.body.club_book_id;

  if (!hostUserId || !id) {
    return res.status(400).json({ message: "Dados inválidos." });
  }

  try {
    const readingDraw = await completeReadingDraw({
      drawId: id,
      hostUserId,
      clubBookId,
    });
    return res.status(200).json({
      message: "Sorteio concluído!",
      readingDraw,
    });
  } catch (error) {
    if (error instanceof ReadingDrawValidationError) {
      return res.status(400).json({ message: error.message });
    }
    if (error instanceof ReadingDrawNotFoundError) {
      return res.status(404).json({ message: error.message });
    }
    if (error instanceof ReadingDrawForbiddenError) {
      return res.status(403).json({ message: error.message });
    }
    console.error(error);
    return res.status(500).json({ message: "Erro ao concluir o sorteio." });
  }
};
