import { Request, Response } from "express";
import { db } from "../db/client";

export const getMyClubs = async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ message: "Usuário não autenticado" });
  }

  try {
    const clubs = await db.club.findMany({
      where: {
        member: {
          some: {
            user_id: userId,
          },
        },
      },
      orderBy: [
        {
          status: "asc",
        },
        {
          created_at: "desc",
        },
      ],
    });

    res.status(200).json(clubs);
  } catch (error) {
    console.error("Erro ao buscar clubes do usuário:", error);
    res.status(500).json({ message: "Erro interno ao buscar clubes" });
  }
};
