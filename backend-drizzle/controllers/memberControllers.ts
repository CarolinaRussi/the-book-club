import { Request, Response } from "express";
import { eq, desc, and, count } from "drizzle-orm";
import { db } from "../db/client";
import { member, user, club } from "../db/schema";
import { UserStatus } from "../enums/userStatus";
import { createId } from "../utils/id";

export const getMembersFromClub = async (req: Request, res: Response) => {
  const { id } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 8;

  if (!id) {
    return res.status(401).json({ message: "Clube não selecionado" });
  }

  try {
    const skip = (page - 1) * limit;

    const membersRows = await db
      .select({
        joinedAt: member.joinedAt,
        userId: user.id,
        userName: user.name,
        userNickname: user.nickname,
        userBio: user.bio,
        userFavoritesGenres: user.favoritesGenres,
        userProfilePicture: user.profilePicture,
        userEmail: user.email,
      })
      .from(member)
      .innerJoin(user, eq(member.userId, user.id))
      .where(and(eq(member.clubId, id), eq(user.status, UserStatus.ACTIVE)))
      .orderBy(desc(user.createdAt))
      .limit(limit)
      .offset(skip);

    const [{ value: totalItems }] = await db
      .select({ value: count() })
      .from(member)
      .innerJoin(user, eq(member.userId, user.id))
      .where(and(eq(member.clubId, id), eq(user.status, UserStatus.ACTIVE)));

    const totalPages = Math.ceil(Number(totalItems ?? 0) / limit);

    const data = membersRows.map((m) => ({
      joinedAt: m.joinedAt,
      user: {
        id: m.userId,
        name: m.userName,
        nickname: m.userNickname,
        bio: m.userBio,
        favoritesGenres: m.userFavoritesGenres,
        profilePicture: m.userProfilePicture,
        email: m.userEmail,
      },
    }));

    return res
      .status(200)
      .json({ data, totalPages, currentPage: page, totalItems: Number(totalItems ?? 0) });
  } catch (error) {
    console.error("Erro ao buscar membros do clube:", error);
    res
      .status(500)
      .json({ message: "Erro interno ao buscar membros" });
  }
};

export const joinClub = async (req: Request, res: Response) => {
  const { userId, clubId } = req.body;

  if (!userId || !clubId) {
    res.status(400).json({ message: "Id do clube ou de usuário inválido!" });
    return;
  }

  try {
    const [newMember] = await db
      .insert(member)
      .values({
        id: createId(),
        clubId,
        userId,
      })
      .returning();

    if (!newMember) {
      return res.status(500).json({ message: "Erro ao adicionar membro" });
    }

    const [clubRow] = await db
      .select({ name: club.name })
      .from(club)
      .where(eq(club.id, clubId))
      .limit(1);

    res.status(201).json({
      message: "Membro adicionado ao clube com sucesso",
      member: {
        ...newMember,
        club: clubRow ? { name: clubRow.name } : null,
      },
    });
  } catch (error: any) {
    if (error?.code === "23505") {
      return res.status(400).json({ message: "JoinClub já realizado" });
    }
    console.error(error);
    res.status(500).json({ message: "Erro ao criar membro do clube" });
  }
};

export const deleteMember = async (req: Request, res: Response) => {
  const { memberId } = req.params;

  if (!memberId) {
    return res.status(401).json({ message: "Membro não selecionado" });
  }

  try {
    const [deleted] = await db
      .delete(member)
      .where(eq(member.id, memberId))
      .returning();

    if (!deleted) {
      return res.status(404).json({ message: "Membro não encontrado" });
    }

    res.status(201).json({
      message: "Membro deletado do clube com sucesso",
      deletedMember: deleted,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao deletar membro do clube" });
  }
};
