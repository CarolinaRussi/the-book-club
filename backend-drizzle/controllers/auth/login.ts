import { type Request, type Response } from "express";
import {
  login as loginUser,
  UserNotFoundOrInactiveError,
  InvalidPasswordError,
} from "../../services/authService";

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Preencha todos os campos!" });
    return;
  }

  try {
    const { token, user } = await loginUser(email, password);
    res.status(201).json({
      message: "Usuário logado com sucesso",
      token,
      user,
    });
  } catch (error) {
    if (error instanceof UserNotFoundOrInactiveError) {
      return res.status(400).json({ message: error.message });
    }
    if (error instanceof InvalidPasswordError) {
      return res.status(401).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: "Erro ao registrar usuário" });
  }
};
