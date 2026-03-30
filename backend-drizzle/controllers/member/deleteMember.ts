import { Request, Response } from "express";
import * as memberService from "../../services/memberService";

export const deleteMember = async (req: Request, res: Response) => {
  const { memberId } = req.params;

  if (!memberId) {
    return res.status(401).json({ message: "Membro não selecionado" });
  }

  try {
    const deleted = await memberService.deleteMember(memberId);

    if (!deleted) {
      return res.status(404).json({ message: "Membro não encontrado" });
    }

    res.status(201).json({
      message: "Membro deletado do clube com sucesso",
      deletedMember: deleted,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao deletar membro do clube" });
  }
};
