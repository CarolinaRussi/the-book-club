import { Request, Response } from "express";
import * as feedService from "../../services/feedService";

function parseClubIdsQuery(raw: unknown): string[] | undefined {
  if (raw == null) return undefined;

  const parts = Array.isArray(raw)
    ? raw.flatMap((value) => String(value).split(","))
    : String(raw).split(",");

  const clubIds = [
    ...new Set(
      parts.map((value) => value.trim()).filter((value) => value.length > 0)
    ),
  ];

  return clubIds.length > 0 ? clubIds : undefined;
}

export const getMyFeed = async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ message: "Usuário não autenticado." });
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const clubIds = parseClubIdsQuery(req.query.clubIds);

  try {
    const payload = await feedService.getMyFeedPaginated(
      userId,
      page,
      limit,
      clubIds
    );
    return res.status(200).json(payload);
  } catch (error) {
    console.error("Erro ao buscar feed:", error);
    return res.status(500).json({ message: "Erro interno ao buscar o feed." });
  }
};
