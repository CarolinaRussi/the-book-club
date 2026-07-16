import { Request, Response } from "express";
import {
  ClubNotJoinableError,
  DuplicateMemberJoinError,
} from "../../services/memberService";
import {
  approveJoinRequest as approveJoinRequestService,
  MembershipRequestNotFoundError,
} from "../../services/membershipRequestService";

export const approveJoinRequest = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { requestId } = req.params;

  if (!userId || !requestId) {
    res.status(400).json({ message: "Pedido inválido." });
    return;
  }

  try {
    await approveJoinRequestService(requestId, userId);
    res.status(200).json({ message: "Pedido aprovado" });
  } catch (error) {
    if (error instanceof MembershipRequestNotFoundError) {
      return res.status(404).json({ message: error.message });
    }
    if (error instanceof DuplicateMemberJoinError) {
      return res.status(400).json({ message: error.message });
    }
    if (error instanceof ClubNotJoinableError) {
      return res.status(404).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: "Erro ao aprovar pedido" });
  }
};
