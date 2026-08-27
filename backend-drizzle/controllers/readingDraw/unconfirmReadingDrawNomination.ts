import { Request, Response } from "express";
import {
  ReadingDrawForbiddenError,
  ReadingDrawNotFoundError,
  ReadingDrawValidationError,
  unconfirmReadingDrawNomination,
} from "../../services/readingDrawService";

export const unconfirmReadingDrawNominationHandler = async (
  req: Request,
  res: Response,
) => {
  const userId = req.userId;
  const { id } = req.params;

  if (!userId || !id) {
    return res.status(400).json({ message: "Dados inválidos." });
  }

  try {
    const readingDraw = await unconfirmReadingDrawNomination(id, userId);
    return res.status(200).json({
      message: "Confirmação desfeita.",
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
    return res.status(500).json({ message: "Erro ao alterar indicação." });
  }
};
