import { Request, Response } from "express";
import * as bookService from "../../services/bookService";

export const getBooksByTitleOrAuthor = async (req: Request, res: Response) => {
  const { q } = req.query;

  try {
    const books = await bookService.getBooksByTitleOrAuthor(
      typeof q === "string" ? q : undefined
    );
    res.status(200).json(books);
  } catch (error) {
    console.error("Erro ao buscar livros:", error);
    res.status(500).json({ message: "Erro interno ao buscar livros" });
  }
};
