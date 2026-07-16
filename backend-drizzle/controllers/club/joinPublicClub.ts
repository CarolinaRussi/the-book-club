import { Request, Response } from "express";
import {
  ClubJoinNotAllowedError,
  ClubNotJoinableError,
  DuplicateMemberJoinError,
  joinClub,
} from "../../services/memberService";

export const joinPublicClub = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;

  if (!userId || !id) {
    res.status(400).json({ message: "Id do clube ou de usuário inválido!" });
    return;
  }

  try {
    const { member } = await joinClub(userId, id, "open_public");
    res.status(201).json({
      message: "Você entrou no clube",
      member,
    });
  } catch (error) {
    if (error instanceof DuplicateMemberJoinError) {
      return res.status(400).json({ message: error.message });
    }
    if (error instanceof ClubJoinNotAllowedError) {
      return res.status(400).json({ message: error.message });
    }
    if (error instanceof ClubNotJoinableError) {
      return res.status(404).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: "Erro ao entrar no clube" });
  }
};
