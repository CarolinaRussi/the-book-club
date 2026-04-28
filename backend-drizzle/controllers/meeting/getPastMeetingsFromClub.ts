import { Request, Response } from "express";
import * as meetingService from "../../services/meetingService";
import { respondIfNotClubMember } from "../../utils/clubAccess";

export const getPastMeetingsFromClub = async (req: Request, res: Response) => {
  const { id } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 4;

  if (!id) {
    return res.status(401).json({ message: "Clube não selecionado" });
  }

  if (!(await respondIfNotClubMember(req.userId, id, res))) {
    return;
  }

  try {
    const payload = await meetingService.getPastMeetingsFromClub(id, page, limit);
    return res.status(200).json(payload);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Erro ao buscar reuniões passadas" });
  }
};
