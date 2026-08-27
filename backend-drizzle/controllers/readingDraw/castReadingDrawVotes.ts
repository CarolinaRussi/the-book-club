import { Request, Response } from "express";
import {
  castReadingDrawVotes,
  ReadingDrawForbiddenError,
  ReadingDrawNotFoundError,
  ReadingDrawValidationError,
} from "../../services/readingDrawService";

export const castReadingDrawVotesHandler = async (
  req: Request,
  res: Response,
) => {
  const userId = req.userId;
  const { id } = req.params;

  if (!userId || !id) {
    return res.status(400).json({ message: "Dados inválidos." });
  }

  try {
    const readingDraw = await castReadingDrawVotes({
      drawId: id,
      userId,
      nominationIds: req.body.nominationIds,
    });
    return res.status(200).json({
      message: "Votos registrados!",
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
    return res.status(500).json({ message: "Erro ao registrar votos." });
  }
};
