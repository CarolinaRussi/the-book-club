import { Request, Response } from "express";
import * as clubService from "../../services/clubService";

export const updateClub = async (req: Request, res: Response) => {
  const { name, description, invitationCode } = req.body;
  const { id } = req.params;

  if (!id || !name || !invitationCode) {
    res.status(400).json({ message: "Preencha todos os campos!" });
    return;
  }

  try {
    const updatedClub = await clubService.updateClub(id, {
      name,
      description,
      invitationCode,
    });

    if (!updatedClub) {
      return res.status(404).json({ message: "Clube não encontrado" });
    }

    res.status(200).json({
      message: "Clube alterado com sucesso",
      club: updatedClub,
    });
  } catch (error: any) {
    if (error?.code === "23503") {
      return res.status(404).json({ message: "Clube não encontrado" });
    }
    console.error(error);
    res.status(500).json({ message: "Erro ao atualizar clube" });
  }
};
