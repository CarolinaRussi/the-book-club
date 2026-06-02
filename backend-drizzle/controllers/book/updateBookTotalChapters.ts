import { Request, Response } from "express";
import {
  ClubBookNotFoundError,
  InvalidBookTotalChaptersError,
  updateBookTotalChapters as updateBookTotalChaptersService,
} from "../../services/bookService";
import { respondIfNotClubMember } from "../../utils/clubAccess";

export const updateBookTotalChapters = async (req: Request, res: Response) => {
  const { clubId, bookId } = req.params;
  const rawTotalChapters = req.body.totalChapters ?? req.body.total_chapters;
  const totalChapters =
    rawTotalChapters !== undefined && rawTotalChapters !== ""
      ? Number(rawTotalChapters)
      : null;

  if (!clubId || !bookId) {
    return res
      .status(400)
      .json({ message: "ID do clube e ID do livro são obrigatórios." });
  }

  if (!(await respondIfNotClubMember(req.userId, clubId, res))) {
    return;
  }

  if (totalChapters === null) {
    return res.status(400).json({
      message: "Total de capítulos deve ser um número inteiro positivo.",
    });
  }

  try {
    const updatedBook = await updateBookTotalChaptersService({
      clubId,
      bookId,
      totalChapters,
    });

    return res.status(200).json({
      message: "Total de capítulos atualizado com sucesso.",
      book: updatedBook,
    });
  } catch (error) {
    if (error instanceof InvalidBookTotalChaptersError) {
      return res.status(400).json({ message: error.message });
    }

    if (error instanceof ClubBookNotFoundError) {
      return res.status(404).json({ message: error.message });
    }

    console.error("Erro ao atualizar total de capítulos:", error);
    return res.status(500).json({
      message: "Erro interno ao atualizar total de capítulos.",
    });
  }
};
