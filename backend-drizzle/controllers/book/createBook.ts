import { Request, Response } from "express";
import {
  createBookForClub,
  BookAlreadyInClubSuggestedError,
} from "../../services/bookService";
import { respondIfNotClubMember } from "../../utils/clubAccess";

export const createBook = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const clubId = req.body.clubId ?? req.body.club_id;
    if (!clubId) {
      return res.status(400).json({ message: "clubId é obrigatório." });
    }
    if (!(await respondIfNotClubMember(req.userId, clubId, res))) {
      return;
    }
    if (!req.userId) {
      return res.status(401).json({ message: "Não autenticado." });
    }
    const openLibraryId = req.body.id;
    const coverUrlOpenLibrary =
      req.body.coverUrlOpenLibrary ?? req.body.cover_url_open_library;

    const rawTotalChapters = req.body.totalChapters ?? req.body.total_chapters;

    const totalChapters =
      rawTotalChapters !== undefined && rawTotalChapters !== ""
        ? Number(rawTotalChapters)
        : null;

    if (
      totalChapters !== null &&
      (!Number.isInteger(totalChapters) || totalChapters < 1)
    ) {
      return res.status(400).json({
        message: "Total de capítulos deve ser um número inteiro positivo.",
      });
    }
    const { title, author } = req.body;

    const newClubBookEntry = await createBookForClub({
      clubId,
      suggestedByUserId: req.userId,
      file,
      openLibraryId,
      coverUrlOpenLibrary,
      title,
      author,
      totalChapters,
    });

    res
      .status(201)
      .json({ message: "Livro criado com sucesso!", book: newClubBookEntry });
  } catch (error: any) {
    if (error instanceof BookAlreadyInClubSuggestedError) {
      return res.status(400).json({ message: error.message });
    }
    console.error("Erro ao criar o livro:", error);
    res.status(500).json({ message: "Erro interno ao criar o livro" });
  }
};
