import { Request, Response } from "express";
import * as meetingRecapService from "../../services/meetingRecapService";

export const getPendingMeetingRecap = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ message: "Usuário não autenticado" });
  }

  try {
    const payload = await meetingRecapService.getPendingMeetingRecap(userId);
    return res.status(200).json(payload);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Erro ao buscar registro de encontro pendente" });
  }
};
