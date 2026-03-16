import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface TokenPayload {
  id: string;
  email: string;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  const parts = authorization.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Token em formato inválido" });
  }

  const token = parts[1];

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET não definido");
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET) as TokenPayload;

    req.userId = payload.id;

    return next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido ou expirado" });
  }
};
