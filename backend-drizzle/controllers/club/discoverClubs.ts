import { Request, Response } from "express";
import * as clubService from "../../services/clubService";
import { MeetingFormat } from "../../enums/meetingFormat";

function parsePositiveInt(value: unknown): number | undefined {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return undefined;
  }
  return parsed;
}

export const discoverClubs = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ message: "Usuário não autenticado" });
  }

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
  const meetingFormat =
    typeof req.query.meetingFormat === "string"
      ? req.query.meetingFormat
      : undefined;
  const q = typeof req.query.q === "string" ? req.query.q : undefined;
  const stateId = parsePositiveInt(req.query.stateId);
  const cityId = parsePositiveInt(req.query.cityId);

  if (
    meetingFormat !== undefined &&
    meetingFormat !== MeetingFormat.IN_PERSON &&
    meetingFormat !== MeetingFormat.REMOTE &&
    meetingFormat !== MeetingFormat.HYBRID
  ) {
    return res.status(400).json({ message: "Formato de encontro inválido." });
  }

  if (req.query.stateId !== undefined && stateId === undefined) {
    return res.status(400).json({ message: "Estado inválido." });
  }
  if (req.query.cityId !== undefined && cityId === undefined) {
    return res.status(400).json({ message: "Cidade inválida." });
  }

  try {
    const payload = await clubService.discoverClubs(userId, {
      page,
      limit,
      meetingFormat,
      stateId,
      cityId,
      q,
    });
    res.status(200).json(payload);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao explorar clubes" });
  }
};
