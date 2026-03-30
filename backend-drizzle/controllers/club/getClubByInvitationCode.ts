import { Request, Response } from "express";
import * as clubService from "../../services/clubService";

export const getClubByInvitationCode = async (req: Request, res: Response) => {
  const { invitationCode } = req.params;

  if (!invitationCode) {
    return res.status(400).json({ message: "Código de Convite não enviado." });
  }

  try {
    const payload = await clubService.getClubByInvitationCode(invitationCode);
    if (!payload) {
      return res
        .status(404)
        .json({ message: "Clube não encontrado ou código inválido." });
    }
    return res.status(200).json(payload);
  } catch (error) {
    console.error("Erro ao buscar clube por código de convite:", error);
    return res
      .status(500)
      .json({ message: "Erro interno ao buscar clubes por código de convite" });
  }
};
