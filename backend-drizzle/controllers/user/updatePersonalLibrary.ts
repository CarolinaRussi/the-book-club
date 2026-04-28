import { Request, Response } from "express";
import * as userService from "../../services/userService";

export const updatePersonalLibrary = async (req: Request, res: Response) => {
  const { bookId, userId: bodyUserId } = req.body;
  const authUserId = req.userId;

  if (!bookId || !bodyUserId) {
    res.status(400).json({ message: "Id do livro ou de usuário inválido!" });
    return;
  }
  if (!authUserId || bodyUserId !== authUserId) {
    res.status(403).json({ message: "Não autorizado." });
    return;
  }

  try {
    const result = await userService.updatePersonalLibrary(authUserId, bookId);

    if (result.action === "removed") {
      return res.status(200).json({
        message: result.message,
        action: result.action,
      });
    }

    return res.status(201).json({
      message: result.message,
      userBook: result.userBook,
      action: result.action,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao atualizar a biblioteca pessoal" });
  }
};
