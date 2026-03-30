import { Request, Response } from "express";
import * as bookService from "../../services/bookService";

export const getBooksByClubId = async (req: Request, res: Response) => {
  const { clubId } = req.params;
  const page = req.query.page ? Number(req.query.page) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const userId = req.userId;

  if (!clubId) {
    return res.status(400).json({ message: "ID do Clube não enviado." });
  }

  try {
    const result = await bookService.getBooksByClubId(
      clubId,
      userId,
      page,
      limit
    );

    if (result.kind === "paginated") {
      return res.status(200).json({
        data: result.data,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        totalItems: result.totalItems,
      });
    }
    return res.status(200).json(result.data);
  } catch (error) {
    console.error("Erro ao buscar livros do clube:", error);
    return res
      .status(500)
      .json({ message: "Erro interno ao buscar livros do clube" });
  }
};
