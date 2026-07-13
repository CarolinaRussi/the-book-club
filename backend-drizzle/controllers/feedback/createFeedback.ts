import { type Request, type Response } from "express";
import {
  createFeedback,
  FeedbackValidationError,
} from "../../services/feedbackService";

export const createFeedbackHandler = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    res.status(401).json({ message: "Não autorizado." });
    return;
  }

  try {
    const result = await createFeedback({
      userId,
      type: req.body?.type,
      message: req.body?.message,
      pageUrl: req.body?.pageUrl,
    });
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof FeedbackValidationError) {
      res.status(400).json({ message: error.message });
      return;
    }
    console.error("Erro ao criar feedback:", error);
    res.status(500).json({ message: "Erro ao enviar feedback." });
  }
};
