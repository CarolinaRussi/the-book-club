import { Request, Response } from "express";
import * as meetingRecapService from "../../services/meetingRecapService";
import * as meetingRepository from "../../repositories/meetingRepository";
import { respondIfNotClubOwner } from "../../utils/clubAccess";

export const createMeetingRecap = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.userId;

  if (!id) {
    return res.status(400).json({ message: "Id do encontro é obrigatório." });
  }
  if (!userId) {
    return res.status(401).json({ message: "Usuário não autenticado" });
  }

  const existing = await meetingRepository.findMeetingById(id);
  if (!existing) {
    return res.status(404).json({ message: "Encontro não encontrado" });
  }
  if (!(await respondIfNotClubOwner(userId, existing.clubId, res))) {
    return;
  }

  try {
    const recap = await meetingRecapService.createMeetingRecap({
      meetingId: id,
      userId,
      text: req.body.text,
      file: req.file,
    });
    return res.status(201).json({
      message: "Registro do encontro criado com sucesso",
      recap,
    });
  } catch (error) {
    if (error instanceof meetingRecapService.MeetingRecapValidationError) {
      return res.status(400).json({ message: error.message });
    }
    if (error instanceof meetingRecapService.MeetingNotEligibleForRecapError) {
      return res.status(400).json({ message: error.message });
    }
    if (error instanceof meetingRecapService.MeetingRecapNotFoundError) {
      return res.status(404).json({ message: error.message });
    }
    if ((error as { code?: string })?.code === "23505") {
      return res.status(400).json({
        message: "Este encontro já possui um registro. Edite ou apague o atual.",
      });
    }
    console.error(error);
    return res.status(500).json({ message: "Erro ao criar registro do encontro" });
  }
};
