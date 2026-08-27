import { Request, Response } from "express";
import {
  ReadingDrawForbiddenError,
  ReadingDrawNotFoundError,
  ReadingDrawValidationError,
  revealReadingDraw,
} from "../../services/readingDrawService";

export const revealReadingDrawHandler = async (req: Request, res: Response) => {
  const hostUserId = req.userId;
  const { id } = req.params;

  if (!hostUserId || !id) {
    return res.status(400).json({ message: "Dados inválidos." });
  }

  try {
    const readingDraw = await revealReadingDraw(id, hostUserId);
    return res.status(200).json({
      message: "Sorteio realizado!",
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
    return res.status(500).json({ message: "Erro ao realizar o sorteio." });
  }
};
