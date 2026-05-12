import { Request, Response } from "express";
import * as meetingService from "../../services/meetingService";
import * as meetingRepository from "../../repositories/meetingRepository";
import { respondIfNotClubMember } from "../../utils/clubAccess";

export const resyncMeetingGoogleCalendar = async (
  req: Request,
  res: Response,
) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "Id obrigatório." });
  }

  const existing = await meetingRepository.findMeetingById(id);
  if (!existing) {
    return res.status(404).json({ message: "Encontro não encontrado" });
  }
  if (!(await respondIfNotClubMember(req.userId, existing.clubId, res))) {
    return;
  }

  try {
    const result = await meetingService.resyncMeetingGoogleCalendar(id);
    return res.status(200).json({
      success: result.success,
      message: result.message,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Erro ao sincronizar com o Google Calendar.",
    });
  }
};
