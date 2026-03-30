import { Request, Response } from "express";
import * as meetingService from "../../services/meetingService";

export const createMeeting = async (req: Request, res: Response) => {
  const { bookId, description, location, meetingDate, meetingTime, clubId } =
    req.body;

  if (!bookId || !location || !meetingDate || !meetingTime || !clubId) {
    res.status(400).json({ message: "Preencha todos os campos!" });
    return;
  }

  try {
    const newMeeting = await meetingService.createMeeting({
      bookId,
      description,
      location,
      meetingDate,
      meetingTime,
      clubId,
    });
    res.status(200).json({
      message: "Encontro marcado com sucesso!",
      meeting: newMeeting,
    });
  } catch (error: any) {
    if (error?.code === "23503") {
      return res
        .status(404)
        .json({ message: "Registro não encontrado para atualizar" });
    }
    console.error(error);
    res.status(500).json({ message: "Erro ao criar encontro" });
  }
};
