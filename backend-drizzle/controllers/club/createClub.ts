import { Request, Response } from "express";
import {
  createClub as createClubService,
  ClubInvitationCodeConflictError,
  ClubMetadataValidationError,
} from "../../services/clubService";
import { ReadingMode } from "../../enums/readingMode";

export const createClub = async (req: Request, res: Response) => {
  const {
    name,
    description,
    visibility,
    joinPolicy,
    meetingFormat,
    stateId,
    cityId,
  } = req.body;
  const ownerId = req.userId;

  if (!name || !description || !ownerId) {
    res.status(400).json({ message: "Preencha todos os campos obrigatórios!" });
    return;
  }

  try {
    const newClub = await createClubService({
      name,
      description,
      ownerId,
      readingMode: ReadingMode.BOOK,
      visibility,
      joinPolicy,
      meetingFormat,
      stateId,
      cityId,
    });
    res.status(201).json({
      message: "Clube criado com sucesso",
      club: newClub,
    });
  } catch (error) {
    if (error instanceof ClubMetadataValidationError) {
      return res.status(400).json({ message: error.message });
    }
    if (error instanceof ClubInvitationCodeConflictError) {
      return res.status(500).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: "Erro ao criar clube" });
  }
};
