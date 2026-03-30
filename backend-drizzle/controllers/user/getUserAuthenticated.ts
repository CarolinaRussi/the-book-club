import { Request, Response } from "express";
import * as userService from "../../services/userService";

export const getUserAuthenticated = async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ message: "Usuário não autenticado" });
  }

  try {
    const foundUser = await userService.getUserAuthenticated(userId);

    if (!foundUser) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    res.status(200).json(foundUser);
  } catch (error) {
    console.error("Erro ao buscar usuário", error);
    res.status(500).json({ message: "Erro interno ao usuário" });
  }
};
