import { Request, Response } from "express";
import * as meetingService from "../../services/meetingService";

export const getMeetingsFromClub = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(401).json({ message: "Clube não selecionado" });
  }

  try {
    const formatted = await meetingService.getMeetingsFromClub(id);
    return res.status(200).json(formatted);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao buscar reuniões" });
  }
};
