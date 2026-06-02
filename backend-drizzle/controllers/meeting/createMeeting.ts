import { Request, Response } from "express";
import * as meetingService from "../../services/meetingService";
import { respondIfNotClubMember } from "../../utils/clubAccess";

export const createMeeting = async (req: Request, res: Response) => {
  const { bookId, description, location, meetingDate, meetingTime, clubId } =
    req.body;

  const chapterStart = req.body.chapterStart
    ? Number(req.body.chapterStart)
    : null;
  const chapterEnd = req.body.chapterEnd ? Number(req.body.chapterEnd) : null;
  const rawTotalChapters = req.body.totalChapters ?? req.body.total_chapters;
  const totalChapters =
    rawTotalChapters !== undefined && rawTotalChapters !== ""
      ? Number(rawTotalChapters)
      : undefined;

  if (!location || !meetingDate || !meetingTime || !clubId) {
    return res.status(400).json({ message: "Preencha todos os campos!" });
  }

  if (!(await respondIfNotClubMember(req.userId, clubId, res))) return;

  const createdByUserId = req.userId;
  if (!createdByUserId) {
    return res.status(401).json({ message: "Não autorizado" });
  }

  try {
    const newMeeting = await meetingService.createMeeting({
      createdByUserId,
      bookId,
      chapterStart,
      chapterEnd,
      totalChapters,
      description,
      location,
      meetingDate,
      meetingTime,
      clubId,
    });

    res.status(200).json({
      message: "Encontro marcado com sucesso!",
      meeting: newMeeting,
    });
  } catch (error: any) {
    if (error instanceof meetingService.InvalidMeetingChapterRangeError) {
      return res.status(400).json({ message: error.message });
    }
    console.error(error);
    res.status(500).json({ message: "Erro ao criar encontro" });
  }
};
