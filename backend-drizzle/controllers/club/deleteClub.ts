import { Request, Response } from "express";
import * as clubService from "../../services/clubService";
import { respondIfNotClubOwner } from "../../utils/clubAccess";

export const deleteClub = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ message: "ID do clube é obrigatório." });
    return;
  }

  if (!(await respondIfNotClubOwner(req.userId, id, res))) {
    return;
  }

  try {
    const deleted = await clubService.deleteClubById(id);
    if (!deleted) {
      res.status(404).json({ message: "Clube não encontrado." });
      return;
    }
    res.status(200).json({ message: "Clube excluído com sucesso." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao excluir o clube." });
  }
};
