import { type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db/pool";
import { UserStatus } from "../enums/userStatus";

export const register = async (req: Request, res: Response) => {
  const { name, lastName, email, nickname, password } = req.body;

  if (!name || !lastName || !email || !nickname || !password) {
    res.status(400).json({ message: "Preencha todos os campos!" });
    return;
  }

  const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  if (userExists.rows.length > 0) {
    return res.status(400).json({ message: "E-mail já cadastrado" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const fullName = `${name} ${lastName}`;
    const result = await pool.query(
      "INSERT INTO users (name, email, nickname, password, status) VALUES ($1, $2, $3, $4) RETURNING *",
      [fullName, email, nickname, hashedPassword, UserStatus.ACTIVE]
    );
    const user = result.rows[0];
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET não definido");
    }
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET!
    );
    res.status(201).json({
      message: "Usuário registrado com sucesso",
      token,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao registrar usuário" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: "Preencha todos os campos!" });
    return;
  }

  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  if (result.rows.length === 0) {
    return res.status(400).json({ message: "Usuário não encontrado" });
  }

  try {
    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(401).json({ message: "Senha inválida" });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET!
    );
    res.status(201).json({
      message: "Usuário logado com sucesso",
      token,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao registrar usuário" });
  }
};
