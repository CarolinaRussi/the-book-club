import { Request, Response } from "express";

import { pool } from "../db/pool";
import { UserStatus } from "../enums/userStatus";

export const getMyClubs = async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ message: "Usuário não autenticado" });
  }

  try {
    const query = `
      SELECT
        clubs.id,
        clubs.name,
        clubs.status,
        clubs.owner_id,
        clubs.description,
        clubs.created_at 
      FROM clubs
      JOIN members ON clubs.id = members.club_id
      WHERE members.user_id = $1
      ORDER BY 
        clubs.status = $2 DESC, 
        clubs.created_at DESC
    `;

    const result = await pool.query(query, [userId, UserStatus.ACTIVE]);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar clubes do usuário:", error);
    res.status(500).json({ message: "Erro interno ao buscar clubes" });
  }
};
