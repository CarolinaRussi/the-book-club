import { Request, Response } from "express";
import { db } from "../db/client";
import { MeetingStatus } from "../enums/meetingStatus";
import { Prisma } from "../generated/prisma/client";
import { BookStatus } from "../enums/bookStatus";

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
      orderBy: [{ meeting_date: "desc" }, { meeting_time: "desc" }],
      select: {
        id: true,
        status: true,
        location: true,
        description: true,
        meeting_date: true,
        meeting_time: true,
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            cover_url: true,
          },
        },
      },
    });

    return res.status(200).json(meetings);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao buscar reuniões" });
  }
};

export const getPastMeetingsFromClub = async (req: Request, res: Response) => {
  const { id } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 5;

  if (!id) {
    return res.status(401).json({ message: "Clube não selecionado" });
  }

  try {
    const skip = (page - 1) * limit;

    const [meetings, totalItems] = await Promise.all([
      db.meeting.findMany({
        where: {
          club_id: id,
          status: {
            in: [MeetingStatus.COMPLETED, MeetingStatus.CANCELLED],
          },
        },
        orderBy: [{ meeting_date: "desc" }, { meeting_time: "desc" }],
        skip,
        take: limit,
        select: {
          id: true,
          status: true,
          location: true,
          description: true,
          meeting_date: true,
          meeting_time: true,
          created_at: true,
          book: {
            select: {
              id: true,
              title: true,
              author: true,
              cover_url: true,
            },
          },
        },
      }),
      db.meeting.count({
        where: {
          club_id: id,
          status: {
            in: [MeetingStatus.COMPLETED, MeetingStatus.CANCELLED],
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return res.status(200).json({
      data: meetings,
      totalPages,
      currentPage: page,
      totalItems,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Erro ao buscar reuniões passadas" });
  }
};

export const createMeeting = async (req: Request, res: Response) => {
  const { bookId, description, location, meetingDate, meetingTime, clubId } =
    req.body;

  if (!bookId || !location || !meetingDate || !meetingTime || !clubId) {
    res.status(400).json({ message: "Preencha todos os campos!" });
    return;
  }

  try {
    const meeting = await db.$transaction(async () => {
      const newMeeting = await db.meeting.create({
        data: {
          location: location,
          description: description,
          meeting_date: meetingDate,
          meeting_time: meetingTime,
          book_id: bookId,
          club_id: clubId,
          status: MeetingStatus.SCHEDULED,
        },
      });

      const clubBookEntry = await db.clubBook.findFirst({
        where: {
          book_id: bookId,
          club_id: clubId,
        },
      });

      if (clubBookEntry && clubBookEntry.status !== BookStatus.STARTED) {
        await db.clubBook.update({
          where: {
            id: clubBookEntry.id,
          },
          data: {
            status: BookStatus.STARTED,
          },
        });
      }

      return newMeeting;
    });

    res.status(200).json({
      message: "Encontro marcado com sucesso!",
      meeting,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return res
          .status(404)
          .json({ message: "Registro não encontrado para atualizar" });
      }
    }
    console.error(error);
    res.status(500).json({ message: "Erro ao criar encontro" });
  }
};

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

  try {
    const meeting = await db.meeting.update({
      where: {
        id: id,
      },
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

    if (status === MeetingStatus.COMPLETED) {
      const clubBookEntry = await db.clubBook.findFirst({
        where: {
          book_id: bookId,
          club_id: clubId,
        },
      });
      if (clubBookEntry) {
        await db.clubBook.update({
          where: {
            id: clubBookEntry.id,
          },
          data: {
            status: BookStatus.FINISHED,
          },
        });
      }
    }

    res.status(200).json({
      message: "Encontro alterado com sucesso",
      meeting,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return res.status(404).json({ message: "Encontro não encontrado" });
      }
    }
    console.error(error);
    res.status(500).json({ message: "Erro ao atualizar encontro" });
  }
};

export const cancelMeeting = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    res
      .status(400)
      .json({ message: "Id deve ser enviado para cancelar o encontro!" });
    return;
  }

  try {
    const meeting = await db.meeting.update({
      where: {
        id: id,
      },
      data: {
        status: MeetingStatus.CANCELLED,
      },
    });

    res.status(200).json({
      message: "Encontro cancelado com sucesso",
      meeting,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return res.status(404).json({ message: "Encontro não encontrado" });
      }
    }
    console.error(error);
    res.status(500).json({ message: "Erro ao cancelar encontro" });
  }
};
