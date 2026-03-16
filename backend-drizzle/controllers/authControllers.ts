import { type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { user } from "../db/schema";
import { UserStatus } from "../enums/userStatus";
import { createId } from "../utils/id";

export const register = async (req: Request, res: Response) => {
  const { name, lastName, email, nickname, password } = req.body;

  if (!name || !lastName || !email || !nickname || !password) {
    res.status(400).json({ message: "Preencha todos os campos!" });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const fullName = `${name} ${lastName}`;

    const [newUser] = await db
      .insert(user)
      .values({
        id: createId(),
        name: fullName,
        email: email,
        nickname: nickname,
        password: hashedPassword,
        status: UserStatus.ACTIVE,
      })
      .returning();

    if (!newUser) {
      return res.status(500).json({ message: "Erro ao registrar usuário" });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET não definido");
    }
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET!
    );

    const { password: _, ...userParaFront } = newUser;

    res.status(201).json({
      message: "Usuário registrado com sucesso",
      token,
      user: userParaFront,
    });
  } catch (error: any) {
    if (error?.code === "23505") {
      return res.status(400).json({ message: "E-mail já cadastrado" });
    }
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

  try {
    const [foundUser] = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (!foundUser || foundUser.status !== UserStatus.ACTIVE) {
      return res
        .status(400)
        .json({ message: "Usuário não encontrado ou inativo" });
    }

    const isMatch = await bcrypt.compare(password, foundUser.password);

    if (!isMatch) {
      res.status(401).json({ message: "Senha inválida" });
      return;
    }

    const token = jwt.sign(
      { id: foundUser.id, email: foundUser.email },
      process.env.JWT_SECRET!
    );

    const { password: _, ...userParaFront } = foundUser;

    res.status(201).json({
      message: "Usuário logado com sucesso",
      token,
      user: userParaFront,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao registrar usuário" });
  }
};
