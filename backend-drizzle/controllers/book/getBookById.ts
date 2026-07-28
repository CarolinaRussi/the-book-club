import { Request, Response } from "express";
import {
  getBookPage,
  BookNotFoundError,
} from "../../services/bookService";

export const getBookById = async (req: Request, res: Response) => {
  const { bookId } = req.params;
  const viewerUserId = req.userId;

  if (!bookId) {
    return res.status(400).json({ message: "ID do livro não enviado." });
  }
  if (!viewerUserId) {
    return res.status(401).json({ message: "Não autorizado." });
  }

  const reviewsScope =
    req.query.scope === "my_clubs" ? ("my_clubs" as const) : ("all" as const);
  const reviewsPage = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const reviewsLimit = Math.min(
    50,
    Math.max(1, parseInt(req.query.limit as string, 10) || 20),
  );

  try {
    const payload = await getBookPage({
      bookId,
      viewerUserId,
      reviewsScope,
      reviewsPage,
      reviewsLimit,
    });
    return res.status(200).json(payload);
  } catch (error) {
    if (error instanceof BookNotFoundError) {
      return res.status(404).json({ message: error.message });
    }
    console.error("Erro ao buscar livro:", error);
    return res.status(500).json({ message: "Erro interno ao buscar o livro." });
  }
};
