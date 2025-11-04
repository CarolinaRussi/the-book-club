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
    res
      .status(500)
      .json({ message: "Erro interno ao buscar clubes do usuário" });
  }
};

export const getClubByInvitationCode = async (req: Request, res: Response) => {
  const { invitationCode } = req.params;

  if (!invitationCode) {
    return res.status(401).json({ message: "Codigo de Convite não enviado." });
  }

  try {
    const club = await db.club.findUnique({
      where: {
        invitation_code: invitationCode,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    res.status(200).json(club);
  } catch (error) {
    console.error("Erro ao buscar clube por código de convite:", error);
    res
      .status(500)
      .json({ message: "Erro interno ao buscar clubes por código de convite" });
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

    await db.member.create({
      data: {
        club_id: club.id,
        user_id: ownerId,
      },
    });

    res.status(201).json({
      message: "Clube criado com sucesso",
      club,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res.status(400).json({ message: "Clube já cadastrado" });
      }
    }
    console.error(error);
    res.status(500).json({ message: "Erro ao criar clube" });
  }
};
