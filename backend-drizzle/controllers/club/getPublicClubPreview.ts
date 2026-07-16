import { Request, Response } from "express";
import * as clubService from "../../services/clubService";

export const getPublicClubPreview = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ message: "Usuário não autenticado" });
  }
  if (!id) {
    return res.status(400).json({ message: "ID do clube é obrigatório." });
  }

  try {
    const clubPreview = await clubService.getPublicClubPreview(userId, id);
    if (!clubPreview) {
      return res.status(404).json({ message: "Clube não encontrado." });
    }
    res.status(200).json({ club: clubPreview });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar clube" });
  }
};
