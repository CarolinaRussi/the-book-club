import { Request, Response } from "express";
import { db } from "../db/client";
import { UserStatus } from "../enums/userStatus";

export const getMemberFromClub = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(401).json({ message: "Clube não selecionado" });
  }

  try {
    const members = await db.member.findMany({
      where: {
        club_id: id,
        user: {
          status: UserStatus.ACTIVE,
        },
      },
      orderBy: {
        user: {
          created_at: "desc",
        },
      },
      select: {
        joined_at: true,
        user: {
          select: {
            name: true,
            nickname: true,
            bio: true,
            favorites_genres: true,
            profile_picture: true,
            email: true,
          },
        },
      },
    });
    res.status(200).json(members);
  } catch (error) {
    console.error("Erro ao buscar membros do clube:", error);
    res.status(500).json({ message: "Erro interno ao buscar membros" });
  }
};