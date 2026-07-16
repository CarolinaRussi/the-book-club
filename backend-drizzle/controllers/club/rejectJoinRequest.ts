import { Request, Response } from "express";
import {
  MembershipRequestNotFoundError,
  rejectJoinRequest as rejectJoinRequestService,
} from "../../services/membershipRequestService";

export const rejectJoinRequest = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { requestId } = req.params;

  if (!userId || !requestId) {
    res.status(400).json({ message: "Pedido inválido." });
    return;
  }

  try {
    await rejectJoinRequestService(requestId, userId);
    res.status(200).json({ message: "Pedido recusado" });
  } catch (error) {
    if (error instanceof MembershipRequestNotFoundError) {
      return res.status(404).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: "Erro ao recusar pedido" });
  }
};
