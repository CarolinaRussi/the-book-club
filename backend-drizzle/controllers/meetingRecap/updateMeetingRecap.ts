import { Request, Response } from "express";
import * as meetingRecapService from "../../services/meetingRecapService";
import * as meetingRepository from "../../repositories/meetingRepository";
import { respondIfNotClubOwner } from "../../utils/clubAccess";

export const updateMeetingRecap = async (req: Request, res: Response) => {
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
    const recap = await meetingRecapService.updateMeetingRecap({
      meetingId: id,
      text: req.body.text,
      file: req.file,
      removeImage: req.body.removeImage ?? req.body.remove_image,
    });
    return res.status(200).json({
      message: "Registro do encontro atualizado com sucesso",
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
    console.error(error);
    return res
      .status(500)
      .json({ message: "Erro ao atualizar registro do encontro" });
  }
};
