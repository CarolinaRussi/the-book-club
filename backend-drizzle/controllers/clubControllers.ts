import { Request, Response } from "express";
import { eq, desc, inArray, count } from "drizzle-orm";
import { db } from "../db/client";
import { club, member, user } from "../db/schema";
import { ClubStatus } from "../enums/clubStatus";
import { generateUniqueInvitationCode } from "../utils/codeGenerator";
import { createId } from "../utils/id";

export const getMyClubs = async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ message: "Usuário não autenticado" });
  }

  try {
    const memberships = await db
      .select()
      .from(member)
      .where(eq(member.userId, userId));

    const clubIds = memberships.map((m) => m.clubId);
    if (clubIds.length === 0) {
      return res.status(200).json([]);
    }

    const result = await db.query.club.findMany({
      where: (c, { inArray }) => inArray(c.id, clubIds),
      orderBy: (c, { desc }) => [desc(c.status), desc(c.createdAt)],
    });

    res.status(200).json(result);
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
    const [clubRow] = await db
      .select()
      .from(club)
      .where(eq(club.invitationCode, invitationCode))
      .limit(1);

    if (!clubRow) {
      return res
        .status(404)
        .json({ message: "Clube não encontrado ou código inválido." });
    }

    const [owner] = await db
      .select({ name: user.name })
      .from(user)
      .where(eq(user.id, clubRow.ownerId))
      .limit(1);

    return res.status(200).json({
      ...clubRow,
      user: owner ? { name: owner.name } : null,
    });
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

    const [newClub] = await db
      .insert(club)
      .values({
        id: createId(),
        name,
        description,
        invitationCode: generatedCode,
        ownerId,
        status: ClubStatus.ACTIVE,
      })
      .returning();

    if (!newClub) {
      return res.status(500).json({ message: "Erro ao criar clube" });
    }

    await db.insert(member).values({
      id: createId(),
      clubId: newClub.id,
      userId: ownerId,
    });

    res.status(201).json({
      message: "Clube criado com sucesso",
      club: newClub,
    });
  } catch (error: any) {
    if (error?.code === "23505") {
      return res
        .status(500)
        .json({ message: "Erro ao gerar código único, tente novamente." });
    }
    console.error(error);
    res.status(500).json({ message: "Erro ao criar clube" });
  }
};

export const getUserClubs = async (req: Request, res: Response) => {
  const userId = req.userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 5;

  if (!userId) {
    return res.status(401).json({ message: "Usuário não autenticado" });
  }

  try {
    const skip = (page - 1) * limit;

    const [clubsData, countResult] = await Promise.all([
      db.query.club.findMany({
        where: (c, { eq }) => eq(c.ownerId, userId),
        orderBy: (c, { desc }) => [desc(c.createdAt)],
        offset: skip,
        limit,
        with: {
          members: {
            columns: { id: true, userId: true, joinedAt: true },
            with: {
              user: {
                columns: { id: true, name: true, email: true, status: true },
              },
            },
          },
        },
        columns: {
          id: true,
          name: true,
          invitationCode: true,
          ownerId: true,
          status: true,
          createdAt: true,
          description: true,
        },
      }),
      db.select({ value: count() }).from(club).where(eq(club.ownerId, userId)),
    ]);

    const totalItems = Number(countResult[0]?.value ?? 0);
    const totalPages = Math.ceil(totalItems / limit);

    const data = clubsData.map((c) => ({
      ...c,
      member: (c as any).members?.map((m: any) => ({
        id: m.id,
        userId: m.userId,
        joinedAt: m.joinedAt,
        user: m.user,
      })),
    }));

    return res
      .status(200)
      .json({ data, totalPages, currentPage: page, totalItems });
  } catch (error) {
    console.error("Erro ao buscar membros do clube:", error);
    res.status(500).json({ message: "Erro interno ao buscar membros" });
  }
};

export const updateClub = async (req: Request, res: Response) => {
  const { name, description, invitationCode } = req.body;
  const { id } = req.params;

  if (!id || !name || !invitationCode) {
    res.status(400).json({ message: "Preencha todos os campos!" });
    return;
  }

  try {
    const [updatedClub] = await db
      .update(club)
      .set({
        name,
        description: description ?? undefined,
        invitationCode,
      })
      .where(eq(club.id, id))
      .returning();

    if (!updatedClub) {
      return res.status(404).json({ message: "Clube não encontrado" });
    }

    res.status(200).json({
      message: "Clube alterado com sucesso",
      club: updatedClub,
    });
  } catch (error: any) {
    if (error?.code === "23503") {
      return res.status(404).json({ message: "Clube não encontrado" });
    }
    console.error(error);
    res.status(500).json({ message: "Erro ao atualizar clube" });
  }
};
