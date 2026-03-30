import { Request, Response } from "express";
import * as userService from "../../services/userService";

export const getBooksByUserId = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 8;

  if (!userId) {
    return res.status(401).json({ message: "Usuário não selecionado" });
  }

  try {
    const payload = await userService.getUserReadingsPaginated(
      userId,
      page,
      limit
    );
    return res.status(200).json(payload);
  } catch (error) {
    console.error("Erro ao buscar livros do usuário:", error);
    res.status(500).json({ message: "Erro interno ao buscar membros" });
  }
};
