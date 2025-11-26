import { Request, Response } from "express";
import { db } from "../db/client";
import { UserStatus } from "../enums/userStatus";
import { Prisma } from "../generated/prisma/client";

export const getMembersFromClub = async (req: Request, res: Response) => {
  const { id } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 8;

  if (!id) {
    return res.status(401).json({ message: "Clube não selecionado" });
  }

  try {
    const skip = (page - 1) * limit;

    const [members, totalItems] = await Promise.all([
      db.member.findMany({
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
        skip,
        take: limit,
        select: {
          joined_at: true,
          user: {
            select: {
              id: true,
              name: true,
              nickname: true,
              bio: true,
              favorites_genres: true,
              profile_picture: true,
              email: true,
            },
          },
        },
      }),
      db.member.count({
        where: {
          club_id: id,
          user: {
            status: UserStatus.ACTIVE,
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return res
      .status(200)
      .json({ data: members, totalPages, currentPage: page, totalItems });
  } catch (error) {
    console.error("Erro ao buscar membros do clube:", error);
    res.status(500).json({ message: "Erro interno ao buscar membros" });
  }
};

export const joinClub = async (req: Request, res: Response) => {
  const { userId, clubId } = req.body;

  if (!userId || !clubId) {
    res.status(400).json({ message: "Id do clube ou de usuário inválido!" });
    return;
  }

  try {
    const member = await db.member.create({
      data: {
        club_id: clubId,
        user_id: userId,
      },
      include: {
        club: {
          select: {
            name: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Membro adicionado ao clube com sucesso",
      member,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res.status(400).json({ message: "JoinClub já realizado" });
      }
    }
    console.error(error);
    res.status(500).json({ message: "Erro ao criar membro do clube" });
  }
};
