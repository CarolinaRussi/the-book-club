import { type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db/client";
import { Prisma } from "../generated/prisma/client";
import { UserStatus } from "../enums/userStatus";

export const register = async (req: Request, res: Response) => {
  const { name, lastName, email, nickname, password } = req.body;

  if (!name || !lastName || !email || !nickname || !password) {
    res.status(400).json({ message: "Preencha todos os campos!" });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const fullName = `${name} ${lastName}`;

    const user = await db.user.create({
      data: {
        name: fullName,
        email: email,
        nickname: nickname,
        password: hashedPassword,
        status: UserStatus.ACTIVE,
      },
    });

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET não definido");
    }
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET!
    );

    const { password: _, ...userParaFront } = user;

    res.status(201).json({
      message: "Usuário registrado com sucesso",
      token,
      user: userParaFront,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res.status(400).json({ message: "E-mail já cadastrado" });
      }
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
    const user = await db.user.findUnique({
      where: { email: email },
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      return res
        .status(400)
        .json({ message: "Usuário não encontrado ou inativo" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(401).json({ message: "Senha inválida" });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET!
    );

    const { password: _, ...userParaFront } = user;

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
