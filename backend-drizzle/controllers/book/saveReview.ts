import { Request, Response } from "express";
import {
  saveReview as saveReviewService,
  NotClubMemberForReviewError,
} from "../../services/bookService";

export const saveReview = async (req: Request, res: Response) => {
  try {
    const readingStatus = req.body.readingStatus ?? req.body.reading_status;
    const { clubId, bookId, rating, comment } = req.body;
    const userId = req.userId;

    if (!clubId || !bookId || !readingStatus || !userId) {
      return res.status(400).json({
        message:
          "Dados incompletos. clubId, bookId e status são obrigatórios.",
      });
    }

    const result = await saveReviewService({
      userId,
      clubId,
      bookId,
      readingStatus,
      rating,
      comment,
    });

    return res.status(201).json({
      message: "Avaliação salva com sucesso!",
      review: result.savedReview,
      userBookStatus: result.savedUserBook.readingStatus,
    });
  } catch (error) {
    if (error instanceof NotClubMemberForReviewError) {
      return res.status(404).json({ message: error.message });
    }
    console.error("Erro ao salvar avaliação:", error);
    return res
      .status(500)
      .json({ message: "Erro interno ao processar a avaliação." });
  }
};
