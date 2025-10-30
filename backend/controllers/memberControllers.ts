import { Request, Response } from "express";

import { pool } from "../db/pool";
import { UserStatus } from "../enums/userStatus";

export const getMemberFromClub = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(401).json({ message: "Clube não selecionado" });
  }

  try {
    const query = `
      SELECT
        users.name,
        users.nickname,
        users.bio,
        users.favorites_genres,
        users.profile_picture,
        users.email,
        members.joined_at
      FROM users
      JOIN members ON users.id = members.user_id
      WHERE members.club_id = $1
      AND users.status = $2
      ORDER BY 
        users.created_at DESC
    `;

    const result = await pool.query(query, [id, UserStatus.ACTIVE]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar clubes do usuário:", error);
    res.status(500).json({ message: "Erro interno ao buscar clubes" });
  }
};
