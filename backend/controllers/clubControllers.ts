import { Request, Response } from "express";
import { db } from "../db/client";
import { ClubStatus } from "../enums/clubStatus";
import { Prisma } from "../generated/prisma/client";

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

export const createClub = async (req: Request, res: Response) => {
  const { name, description, invitationCode, ownerId } = req.body;

  if (!name || !description || !invitationCode || !ownerId) {
    res.status(400).json({ message: "Preencha todos os campos!" });
    return;
  }

  try {
    const club = await db.club.create({
      data: {
        name: name,
        description: description,
        invitation_code: invitationCode,
        owner_id: ownerId,
        status: ClubStatus.ACTIVE,
      },
    });

    const member = await db.member.create({
      data: {
        club_id: club.id,
        user_id: ownerId,
      },
    });

    res.status(201).json({
      message: "Clube criado com sucesso",
      member,
      club,
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
