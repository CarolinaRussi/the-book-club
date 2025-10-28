import { type Request, type Response } from "express";
import bcrypt from "bcryptjs";
//import jwt from 'jsonwebtoken';
import { client } from "../../db/client";
import { UserStatus } from "../enums/userStatus";

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ message: "Preencha todos os campos!" });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await client.query(
      "INSERT INTO users (name, email, password, status) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email, hashedPassword, UserStatus.ACTIVE]
    );
    const user = result.rows[0];
    res.status(201).json({ message: "Usuário registrado com sucesso", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao registrar usuário" });
  }
};
