import { Request, Response } from "express";
import * as meetingService from "../../services/meetingService";

export const getMyUpcomingMeetings = async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ message: "Usuário não autenticado." });
  }

  const limit = Math.min(parseInt(req.query.limit as string) || 5, 20);

  try {
    const payload = await meetingService.getMyUpcomingMeetings(userId, limit);
    return res.status(200).json(payload);
  } catch (error) {
    console.error("Erro ao buscar próximos encontros:", error);
    return res
      .status(500)
      .json({ message: "Erro interno ao buscar próximos encontros." });
  }
};
