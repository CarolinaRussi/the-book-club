import { Request, Response } from "express";
import {
  ClubBookNotFoundError,
  DeleteClubBookForbiddenError,
  deleteBookFromClub as deleteBookFromClubService,
} from "../../services/bookService";
import { respondIfNotClubMember } from "../../utils/clubAccess";

export const deleteBookFromClub = async (req: Request, res: Response) => {
  const { clubId, bookId } = req.params;
  const userId = req.userId;

  if (!clubId || !bookId) {
    return res
      .status(400)
      .json({ message: "ID do clube e ID do livro são obrigatórios." });
  }

  if (!(await respondIfNotClubMember(userId, clubId, res))) {
    return;
  }

  if (!userId) {
    return res.status(401).json({ message: "Não autenticado." });
  }

  try {
    await deleteBookFromClubService({ clubId, bookId, userId });
    return res.status(200).json({ message: "Livro excluído com sucesso." });
  } catch (error) {
    if (error instanceof ClubBookNotFoundError) {
      return res.status(404).json({ message: error.message });
    }

    if (error instanceof DeleteClubBookForbiddenError) {
      return res.status(403).json({ message: error.message });
    }

    console.error("Erro ao excluir livro do clube:", error);
    return res.status(500).json({ message: "Erro interno ao excluir livro" });
  }
};
