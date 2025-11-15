import { Request, Response } from "express";
import { db } from "../db/client";
import { MeetingStatus } from "../enums/meetingStatus";
import { Prisma } from "../generated/prisma/client";

export const getMeetingsFromClub = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(401).json({ message: "Clube não selecionado" });
  }

  try {
    const meetings = await db.meeting.findMany({
      where: {
        club_id: id,
      },
      select: {
        status: true,
        location: true,
        description: true,
        meeting_date: true,
        meeting_time: true,
        book: {
          select: {
            title: true,
            author: true,
            cover_url: true,
          },
        },
      },
    });

    const statusOrder = {
      [MeetingStatus.SCHEDULED]: 1,
      [MeetingStatus.COMPLETED]: 2,
      [MeetingStatus.CANCELLED]: 3,
    };

    const sortedMeetings = meetings.sort((a, b) => {
      const orderA = statusOrder[a.status];
      const orderB = statusOrder[b.status];

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      return (
        new Date(b.meeting_date).getTime() - new Date(a.meeting_date).getTime()
      );
    });

    res.status(200).json(sortedMeetings);
  } catch (error) {
    console.error("Erro ao buscar membros do clube:", error);
    res.status(500).json({ message: "Erro interno ao buscar membros" });
  }
};

export const createMeeting = async (req: Request, res: Response) => {
  const {
    bookId,
    description,
    location,
    meetingDate,
    meetingTime,
    status,
    clubId,
  } = req.body;

  if (
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

  try {
    const meeting = await db.meeting.create({
      data: {
        location: location,
        description: description,
        meeting_date: meetingDate,
        meeting_time: meetingTime,
        book_id: bookId,
        club_id: clubId,
        status: status,
      },
    });

    res.status(201).json({
      message: "Encontro marcado com sucesso",
      meeting,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res.status(400).json({ message: "Clube já cadastrado" });
      }
    }
    console.error(error);
    res.status(500).json({ message: "Erro ao criar clube" });
  }
};
