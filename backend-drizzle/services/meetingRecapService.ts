import { v2 as cloudinary } from "cloudinary";
import { MeetingStatus } from "../enums/meetingStatus";
import { createId } from "../utils/id";
import { uploadToCloudinary } from "../utils/cloudinary";
import * as meetingRepository from "../repositories/meetingRepository";
import * as meetingRecapRepository from "../repositories/meetingRecapRepository";

const MEETING_RECAP_FOLDER = "meeting_recaps";
const MAX_RECAP_TEXT_LENGTH = 4000;

export class MeetingRecapValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MeetingRecapValidationError";
  }
}

export class MeetingRecapNotFoundError extends Error {
  constructor(message = "Registro do encontro não encontrado.") {
    super(message);
    this.name = "MeetingRecapNotFoundError";
  }
}

export class MeetingNotEligibleForRecapError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MeetingNotEligibleForRecapError";
  }
}

function normalizeRecapText(rawText: unknown): string | null {
  if (rawText === undefined || rawText === null) return null;
  const trimmed = String(rawText).trim();
  return trimmed.length > 0 ? trimmed : null;
}

function assertTextOrImage(text: string | null, hasImage: boolean) {
  if (!text && !hasImage) {
    throw new MeetingRecapValidationError(
      "Informe um texto ou uma foto para o registro do encontro.",
    );
  }
  if (text && text.length > MAX_RECAP_TEXT_LENGTH) {
    throw new MeetingRecapValidationError(
      `O texto pode ter no máximo ${MAX_RECAP_TEXT_LENGTH} caracteres.`,
    );
  }
}

function formatRecap(recap: {
  id: string;
  meetingId: string;
  createdByUserId: string;
  text: string | null;
  imageUrl: string | null;
  imagePublicId: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: recap.id,
    meetingId: recap.meetingId,
    createdByUserId: recap.createdByUserId,
    text: recap.text,
    imageUrl: recap.imageUrl,
    createdAt: recap.createdAt,
    updatedAt: recap.updatedAt,
  };
}

async function requireCompletedMeeting(meetingId: string) {
  const existing = await meetingRepository.findMeetingById(meetingId);
  if (!existing) {
    throw new MeetingRecapNotFoundError("Encontro não encontrado.");
  }
  if (existing.status !== MeetingStatus.COMPLETED) {
    throw new MeetingNotEligibleForRecapError(
      "Só é possível registrar encontros concluídos.",
    );
  }
  return existing;
}

export async function createMeetingRecap(input: {
  meetingId: string;
  userId: string;
  text?: unknown;
  file?: Express.Multer.File;
}) {
  const meetingRow = await requireCompletedMeeting(input.meetingId);
  const existingRecap =
    await meetingRecapRepository.findActiveRecapByMeetingId(input.meetingId);
  if (existingRecap) {
    throw new MeetingRecapValidationError(
      "Este encontro já possui um registro. Edite ou apague o atual.",
    );
  }

  const text = normalizeRecapText(input.text);
  assertTextOrImage(text, Boolean(input.file));

  let imageUrl: string | null = null;
  let imagePublicId: string | null = null;
  if (input.file) {
    const uploadResult = await uploadToCloudinary(
      input.file.buffer,
      MEETING_RECAP_FOLDER,
    );
    imageUrl = uploadResult.secure_url;
    imagePublicId = uploadResult.public_id;
  }

  const created = await meetingRecapRepository.insertMeetingRecap({
    id: createId(),
    meetingId: meetingRow.id,
    createdByUserId: input.userId,
    text,
    imageUrl,
    imagePublicId,
  });

  if (!created) {
    throw new Error("Falha ao criar registro do encontro.");
  }

  return formatRecap(created);
}

export async function updateMeetingRecap(input: {
  meetingId: string;
  text?: unknown;
  file?: Express.Multer.File;
  removeImage?: string | boolean;
}) {
  await requireCompletedMeeting(input.meetingId);
  const existingRecap =
    await meetingRecapRepository.findActiveRecapByMeetingId(input.meetingId);
  if (!existingRecap) {
    throw new MeetingRecapNotFoundError();
  }

  const text =
    input.text !== undefined
      ? normalizeRecapText(input.text)
      : existingRecap.text;

  const removeImage =
    input.removeImage === "true" || input.removeImage === true;

  let imageUrl = existingRecap.imageUrl;
  let imagePublicId = existingRecap.imagePublicId;
  const oldPublicId = existingRecap.imagePublicId;

  if (removeImage) {
    imageUrl = null;
    imagePublicId = null;
  } else if (input.file) {
    const uploadResult = await uploadToCloudinary(
      input.file.buffer,
      MEETING_RECAP_FOLDER,
    );
    imageUrl = uploadResult.secure_url;
    imagePublicId = uploadResult.public_id;
  }

  assertTextOrImage(text, Boolean(imageUrl));

  const updated = await meetingRecapRepository.updateActiveMeetingRecap(
    input.meetingId,
    { text, imageUrl, imagePublicId },
  );

  if (!updated) {
    throw new MeetingRecapNotFoundError();
  }

  if (
    oldPublicId &&
    (removeImage || input.file) &&
    oldPublicId !== imagePublicId
  ) {
    await cloudinary.uploader.destroy(oldPublicId).catch((error) => {
      console.error(error);
    });
  }

  return formatRecap(updated);
}

export async function deleteMeetingRecap(meetingId: string) {
  await requireCompletedMeeting(meetingId);
  const existingRecap =
    await meetingRecapRepository.findActiveRecapByMeetingId(meetingId);
  if (!existingRecap) {
    throw new MeetingRecapNotFoundError();
  }

  const deleted =
    await meetingRecapRepository.softDeleteActiveMeetingRecap(meetingId);
  if (!deleted) {
    throw new MeetingRecapNotFoundError();
  }

  if (existingRecap.imagePublicId) {
    await cloudinary.uploader
      .destroy(existingRecap.imagePublicId)
      .catch((error) => {
        console.error(error);
      });
  }

  return { id: deleted.id, meetingId: deleted.meetingId };
}

export async function dismissMeetingRecapPrompt(meetingId: string) {
  const meetingRow = await requireCompletedMeeting(meetingId);
  const dismissed =
    await meetingRecapRepository.dismissMeetingRecapPrompt(meetingRow.id);
  if (!dismissed) {
    throw new MeetingRecapNotFoundError("Encontro não encontrado.");
  }
  return dismissed;
}

export async function getPendingMeetingRecap(userId: string) {
  const row =
    await meetingRecapRepository.findPendingMeetingRecapForOwner(userId);
  if (!row) {
    return { meeting: null };
  }

  return {
    meeting: {
      id: row.id,
      meetingDate: row.meetingDate,
      meetingTime: row.meetingTime,
      location: row.location,
      description: row.description,
      club: {
        id: row.clubId,
        name: row.clubName,
      },
      book: row.bookId
        ? {
            id: row.bookId,
            title: row.bookTitle,
            author: row.bookAuthor,
            coverUrl: row.bookCoverUrl,
          }
        : null,
    },
  };
}
