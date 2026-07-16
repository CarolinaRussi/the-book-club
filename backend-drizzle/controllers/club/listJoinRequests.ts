import { Request, Response } from "express";
import { respondIfNotClubOwner } from "../../utils/clubAccess";
import { listPendingJoinRequests } from "../../services/membershipRequestService";

export const listJoinRequests = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ message: "ID do clube é obrigatório." });
    return;
  }

  if (!(await respondIfNotClubOwner(req.userId, id, res))) {
    return;
  }

  try {
    const data = await listPendingJoinRequests(id);
    res.status(200).json({ data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao listar pedidos de entrada" });
  }
};
