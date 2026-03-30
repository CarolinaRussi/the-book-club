import { Request, Response } from "express";
import * as meetingService from "../../services/meetingService";

export const cancelMeeting = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    res
      .status(400)
      .json({ message: "Id deve ser enviado para cancelar o encontro!" });
    return;
  }

  try {
    const updatedMeeting = await meetingService.cancelMeeting(id);

    if (!updatedMeeting) {
      return res.status(404).json({ message: "Encontro não encontrado" });
    }

    res.status(200).json({
      message: "Encontro cancelado com sucesso",
      meeting: updatedMeeting,
    });
  } catch (error: any) {
    if (error?.code === "23503") {
      return res.status(404).json({ message: "Encontro não encontrado" });
    }
    console.error(error);
    res.status(500).json({ message: "Erro ao cancelar encontro" });
  }
};
