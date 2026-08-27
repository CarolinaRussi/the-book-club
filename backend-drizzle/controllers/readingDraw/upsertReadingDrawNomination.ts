import { Request, Response } from "express";
import {
  ReadingDrawForbiddenError,
  ReadingDrawNotFoundError,
  ReadingDrawValidationError,
  upsertReadingDrawNomination,
} from "../../services/readingDrawService";

export const upsertReadingDrawNominationHandler = async (
  req: Request,
  res: Response,
) => {
  const userId = req.userId;
  const { id } = req.params;
  const title = req.body.title;
  const author = req.body.author;

  if (!userId || !id) {
    return res.status(400).json({ message: "Dados inválidos." });
  }

  try {
    const readingDraw = await upsertReadingDrawNomination({
      drawId: id,
      userId,
      title,
      author,
    });
    return res.status(200).json({
      message: "Indicação salva.",
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
    return res.status(500).json({ message: "Erro ao salvar indicação." });
  }
};
