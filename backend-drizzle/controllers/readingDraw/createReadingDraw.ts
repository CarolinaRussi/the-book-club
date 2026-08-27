import { Request, Response } from "express";
import {
  createReadingDraw,
  ReadingDrawActiveExistsError,
  ReadingDrawNotFoundError,
  ReadingDrawValidationError,
} from "../../services/readingDrawService";
import { respondIfNotClubMember } from "../../utils/clubAccess";

export const createReadingDrawHandler = async (req: Request, res: Response) => {
  const { clubId } = req.params;
  const hostUserId = req.userId;
  const participantUserIds = req.body.participantUserIds;
  const deadlineAt = req.body.deadlineAt ?? req.body.deadline_at;

  if (!clubId || !hostUserId) {
    return res.status(400).json({ message: "Dados inválidos." });
  }

  if (!(await respondIfNotClubMember(hostUserId, clubId, res))) return;

  if (!Array.isArray(participantUserIds)) {
    return res.status(400).json({
      message: "Informe a lista de participantes (participantUserIds).",
    });
  }

  try {
    const readingDraw = await createReadingDraw({
      clubId,
      hostUserId,
      participantUserIds: participantUserIds.map(String),
      deadlineAt,
      mode: req.body.mode,
    });
    return res.status(201).json({
      message: "Sorteio criado com sucesso!",
      readingDraw,
    });
  } catch (error) {
    if (error instanceof ReadingDrawValidationError) {
      return res.status(400).json({ message: error.message });
    }
    if (error instanceof ReadingDrawActiveExistsError) {
      return res.status(400).json({ message: error.message });
    }
    if (error instanceof ReadingDrawNotFoundError) {
      return res.status(404).json({ message: error.message });
    }
    console.error(error);
    return res.status(500).json({ message: "Erro ao criar sorteio." });
  }
};
