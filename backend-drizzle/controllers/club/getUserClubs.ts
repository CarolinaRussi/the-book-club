import { Request, Response } from "express";
import * as clubService from "../../services/clubService";

export const getUserClubs = async (req: Request, res: Response) => {
  const userId = req.userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 5;

  if (!userId) {
    return res.status(401).json({ message: "Usuário não autenticado" });
  }

  try {
    const payload = await clubService.getUserClubs(userId, page, limit);
    return res.status(200).json(payload);
  } catch (error) {
    console.error("Erro ao buscar membros do clube:", error);
    res.status(500).json({ message: "Erro interno ao buscar membros" });
  }
};
