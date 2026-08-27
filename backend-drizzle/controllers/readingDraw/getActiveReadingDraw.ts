import { Request, Response } from "express";
import {
  getActiveReadingDrawForClub,
  ReadingDrawForbiddenError,
} from "../../services/readingDrawService";
import { respondIfNotClubMember } from "../../utils/clubAccess";

export const getActiveReadingDrawHandler = async (
  req: Request,
  res: Response,
) => {
  const { clubId } = req.params;
  const viewerUserId = req.userId;

  if (!clubId || !viewerUserId) {
    return res.status(400).json({ message: "Dados inválidos." });
  }

  if (!(await respondIfNotClubMember(viewerUserId, clubId, res))) return;

  try {
    const readingDraw = await getActiveReadingDrawForClub(
      clubId,
      viewerUserId,
    );
    return res.status(200).json({ readingDraw });
  } catch (error) {
    if (error instanceof ReadingDrawForbiddenError) {
      return res.status(403).json({ message: error.message });
    }
    console.error(error);
    return res.status(500).json({ message: "Erro ao buscar sorteio ativo." });
  }
};
