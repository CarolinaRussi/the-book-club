import { Request, Response } from "express";
import {
  leaveClub as leaveClubService,
  NotClubMemberError,
  ClubOwnerCannotLeaveError,
} from "../../services/memberService";

export const leaveClub = async (req: Request, res: Response) => {
  const { clubId } = req.params;
  const userId = req.userId;

  if (!clubId) {
    return res.status(400).json({ message: "Clube não selecionado" });
  }
  if (!userId) {
    return res.status(401).json({ message: "Usuário não autenticado" });
  }

  try {
    const deleted = await leaveClubService(userId, clubId);
    res.status(200).json({
      message: "Você saiu do clube com sucesso",
      deletedMember: deleted,
    });
  } catch (error) {
    if (error instanceof NotClubMemberError) {
      return res.status(404).json({ message: error.message });
    }
    if (error instanceof ClubOwnerCannotLeaveError) {
      return res.status(403).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: "Erro ao sair do clube" });
  }
};
