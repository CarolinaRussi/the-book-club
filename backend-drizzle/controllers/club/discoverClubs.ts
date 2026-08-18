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

function parseCoordinate(value: unknown): number | undefined {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return undefined;
  }
  return parsed;
}

function parseBbox(query: Request["query"]) {
  const minLat = parseCoordinate(query.minLat);
  const maxLat = parseCoordinate(query.maxLat);
  const minLng = parseCoordinate(query.minLng);
  const maxLng = parseCoordinate(query.maxLng);
  const presentCount = [minLat, maxLat, minLng, maxLng].filter(
    (value) => value !== undefined,
  ).length;

  if (presentCount === 0) {
    return { ok: true as const, bbox: undefined };
  }
  if (
    presentCount !== 4 ||
    minLat === undefined ||
    maxLat === undefined ||
    minLng === undefined ||
    maxLng === undefined
  ) {
    return { ok: false as const };
  }
  if (
    minLat < -90 ||
    maxLat > 90 ||
    minLat >= maxLat ||
    minLng < -180 ||
    maxLng > 180 ||
    minLng >= maxLng
  ) {
    return { ok: false as const };
  }

  return {
    ok: true as const,
    bbox: { minLat, maxLat, minLng, maxLng },
  };
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

  const bboxResult = parseBbox(req.query);
  if (!bboxResult.ok) {
    return res.status(400).json({ message: "Área do mapa inválida." });
  }

  try {
    const payload = await clubService.discoverClubs(userId, {
      page,
      limit,
      meetingFormat,
      stateId,
      cityId,
      q,
      bbox: bboxResult.bbox,
    });
    res.status(200).json(payload);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao explorar clubes" });
  }
};
