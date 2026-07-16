import { Request, Response } from "express";
import {
  ClubJoinNotAllowedError,
  ClubNotJoinableError,
  DuplicateMemberJoinError,
} from "../../services/memberService";
import {
  createJoinRequest as createJoinRequestService,
  MembershipRequestConflictError,
} from "../../services/membershipRequestService";

export const createJoinRequest = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { id } = req.params;

  if (!userId || !id) {
    res.status(400).json({ message: "Id do clube ou de usuário inválido!" });
    return;
  }

  try {
    const request = await createJoinRequestService(userId, id);
    res.status(201).json({
      message: "Pedido de entrada enviado",
      request: {
        id: request.id,
        clubId: request.clubId,
        status: request.status,
        createdAt: request.createdAt,
      },
    });
  } catch (error) {
    if (
      error instanceof DuplicateMemberJoinError ||
      error instanceof ClubJoinNotAllowedError ||
      error instanceof MembershipRequestConflictError
    ) {
      return res.status(400).json({ message: error.message });
    }
    if (error instanceof ClubNotJoinableError) {
      return res.status(404).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: "Erro ao enviar pedido de entrada" });
  }
};
