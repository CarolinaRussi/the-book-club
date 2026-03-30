import { Request, Response } from "express";
import {
  joinClub as joinClubService,
  DuplicateMemberJoinError,
} from "../../services/memberService";

export const joinClub = async (req: Request, res: Response) => {
  const { userId, clubId } = req.body;

  if (!userId || !clubId) {
    res.status(400).json({ message: "Id do clube ou de usuário inválido!" });
    return;
  }

  try {
    const { member } = await joinClubService(userId, clubId);
    res.status(201).json({
      message: "Membro adicionado ao clube com sucesso",
      member,
    });
  } catch (error) {
    if (error instanceof DuplicateMemberJoinError) {
      return res.status(400).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: "Erro ao criar membro do clube" });
  }
};
