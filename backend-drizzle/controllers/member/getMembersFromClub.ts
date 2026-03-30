import { Request, Response } from "express";
import * as memberService from "../../services/memberService";

export const getMembersFromClub = async (req: Request, res: Response) => {
  const { id } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 8;

  if (!id) {
    return res.status(401).json({ message: "Clube não selecionado" });
  }

  try {
    const payload = await memberService.getMembersFromClub(id, page, limit);
    return res.status(200).json(payload);
  } catch (error) {
    console.error("Erro ao buscar membros do clube:", error);
    res.status(500).json({ message: "Erro interno ao buscar membros" });
  }
};
