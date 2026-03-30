import { Request, Response } from "express";
import * as clubService from "../../services/clubService";

export const getMyClubs = async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ message: "Usuário não autenticado" });
  }

  try {
    const result = await clubService.getMyClubs(userId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Erro ao buscar clubes do usuário:", error);
    res
      .status(500)
      .json({ message: "Erro interno ao buscar clubes do usuário" });
  }
};
