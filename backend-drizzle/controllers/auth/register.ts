import { type Request, type Response } from "express";
import {
  register as registerUser,
  DuplicateEmailError,
  JwtSecretMissingError,
} from "../../services/authService";

export const register = async (req: Request, res: Response) => {
  const { name, lastName, email, nickname, password } = req.body;

  if (!name || !lastName || !email || !nickname || !password) {
    res.status(400).json({ message: "Preencha todos os campos!" });
    return;
  }

  try {
    const { token, user } = await registerUser({
      name,
      lastName,
      email,
      nickname,
      password,
    });
    res.status(201).json({
      message: "Usuário registrado com sucesso",
      token,
      user,
    });
  } catch (error) {
    if (error instanceof DuplicateEmailError) {
      return res.status(400).json({ message: error.message });
    }
    if (error instanceof JwtSecretMissingError) {
      console.error(error);
      return res.status(500).json({ message: "Erro ao registrar usuário" });
    }
    console.error(error);
    res.status(500).json({ message: "Erro ao registrar usuário" });
  }
};
