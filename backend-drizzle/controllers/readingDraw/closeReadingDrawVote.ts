import { Request, Response } from "express";
import {
  closeReadingDrawVote,
  ReadingDrawForbiddenError,
  ReadingDrawNotFoundError,
  ReadingDrawValidationError,
} from "../../services/readingDrawService";

export const closeReadingDrawVoteHandler = async (
  req: Request,
  res: Response,
) => {
  const hostUserId = req.userId;
  const { id } = req.params;

  if (!hostUserId || !id) {
    return res.status(400).json({ message: "Dados inválidos." });
  }

  try {
    const readingDraw = await closeReadingDrawVote(id, hostUserId);
    const message =
      readingDraw.status === "awaiting_book"
        ? "Votação encerrada! Hora de cadastrar o livro na biblioteca."
        : "Empate! Nova rodada só com os empatados.";
    return res.status(200).json({
      message,
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
    return res.status(500).json({ message: "Erro ao fechar a votação." });
  }
};
