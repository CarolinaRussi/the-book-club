import { Request, Response } from "express";
import * as meetingService from "../../services/meetingService";

export const updateMeeting = async (req: Request, res: Response) => {
  const {
    bookId,
    description,
    location,
    meetingDate,
    meetingTime,
    status,
    clubId,
  } = req.body;

  const { id } = req.params;

  if (
    !id ||
    !bookId ||
    !location ||
    !meetingDate ||
    !meetingTime ||
    !status ||
    !clubId
  ) {
    res.status(400).json({ message: "Preencha todos os campos!" });
    return;
  }

  try {
    const updatedMeeting = await meetingService.updateMeeting(id, {
      bookId,
      description,
      location,
      meetingDate,
      meetingTime,
      status,
      clubId,
    });

    if (!updatedMeeting) {
      return res.status(404).json({ message: "Encontro não encontrado" });
    }

    res.status(200).json({
      message: "Encontro alterado com sucesso",
      meeting: updatedMeeting,
    });
  } catch (error: any) {
    if (error?.code === "23503") {
      return res.status(404).json({ message: "Encontro não encontrado" });
    }
    console.error(error);
    res.status(500).json({ message: "Erro ao atualizar encontro" });
  }
};
