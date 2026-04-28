import { Request, Response } from "express";
import * as meetingService from "../../services/meetingService";
import * as meetingRepository from "../../repositories/meetingRepository";
import { respondIfNotClubMember } from "../../utils/clubAccess";

export const updateMeeting = async (req: Request, res: Response) => {
  const {
    bookId,
    description,
    location,
    meetingDate,
    meetingTime,
    status,
    clubId,
  } = req.body;

  const { id } = req.params;

  if (
    !id ||
    !bookId ||
    !location ||
    !meetingDate ||
    !meetingTime ||
    !status ||
    !clubId
  ) {
    res.status(400).json({ message: "Preencha todos os campos!" });
    return;
  }

  const existing = await meetingRepository.findMeetingById(id);
  if (!existing) {
    return res.status(404).json({ message: "Encontro não encontrado" });
  }
  if (clubId !== existing.clubId) {
    return res.status(400).json({ message: "Dados do encontro inválidos." });
  }
  if (!(await respondIfNotClubMember(req.userId, existing.clubId, res))) {
    return;
  }

  try {
    const updatedMeeting = await meetingService.updateMeeting(id, {
      bookId,
      description,
      location,
      meetingDate,
      meetingTime,
      status,
      clubId: existing.clubId,
    });

    if (!updatedMeeting) {
      return res.status(404).json({ message: "Encontro não encontrado" });
    }

    res.status(200).json({
      message: "Encontro alterado com sucesso",
      meeting: updatedMeeting,
    });
  } catch (error: any) {
    if (error?.code === "23503") {
      return res.status(404).json({ message: "Encontro não encontrado" });
    }
    console.error(error);
    res.status(500).json({ message: "Erro ao atualizar encontro" });
  }
};
