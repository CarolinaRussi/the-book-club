import { Request, Response } from "express";
import * as memberService from "../../services/memberService";
import * as memberRepository from "../../repositories/memberRepository";
import * as clubRepository from "../../repositories/clubRepository";

export const deleteMember = async (req: Request, res: Response) => {
  const { memberId } = req.params;
  const userId = req.userId;

  if (!memberId) {
    return res.status(401).json({ message: "Membro não selecionado" });
  }
  if (!userId) {
    return res.status(401).json({ message: "Usuário não autenticado" });
  }

  try {
    const memberRow = await memberRepository.findMemberById(memberId);
    if (!memberRow) {
      return res.status(404).json({ message: "Membro não encontrado" });
    }

    const isSelf = memberRow.userId === userId;
    if (!isSelf) {
      const ownerId = await clubRepository.findClubOwnerId(memberRow.clubId);
      if (!ownerId || ownerId !== userId) {
        return res.status(403).json({
          message:
            "Você só pode sair do clube por conta própria ou remover membros como administrador.",
        });
      }
    }

    const ownerId = await clubRepository.findClubOwnerId(memberRow.clubId);
    if (isSelf && ownerId === userId) {
      return res.status(403).json({
        message:
          "O administrador não pode sair do clube sem transferir a propriedade.",
      });
    }

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
