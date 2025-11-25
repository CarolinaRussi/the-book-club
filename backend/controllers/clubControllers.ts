import { Request, Response } from "express";
import { db } from "../db/client";
import { ClubStatus } from "../enums/clubStatus";
import { Prisma } from "../generated/prisma/client";
import { generateUniqueInvitationCode } from "../utils/codeGenerator";

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
    return res.status(400).json({ message: "Código de Convite não enviado." });
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

    if (!club) {
      return res
        .status(404)
        .json({ message: "Clube não encontrado ou código inválido." });
    }

    return res.status(200).json(club);
  } catch (error) {
    console.error("Erro ao buscar clube por código de convite:", error);
    return res
      .status(500)
      .json({ message: "Erro interno ao buscar clubes por código de convite" });
  }
};

export const createClub = async (req: Request, res: Response) => {
  const { name, description, ownerId } = req.body;

  if (!name || !description || !ownerId) {
    res.status(400).json({ message: "Preencha todos os campos obrigatórios!" });
    return;
  }

  try {
    const generatedCode = await generateUniqueInvitationCode(name, db);

    const club = await db.club.create({
      data: {
        name: name,
        description: description,
        invitation_code: generatedCode,
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
        const target = (error.meta?.target as string[]) || [];
        if (target.includes("invitation_code")) {
          return res
            .status(500)
            .json({ message: "Erro ao gerar código único, tente novamente." });
        }
        return res
          .status(400)
          .json({ message: "Dados duplicados (Nome ou ID)." });
      }
    }
    console.error(error);
    res.status(500).json({ message: "Erro ao criar clube" });
  }
};
