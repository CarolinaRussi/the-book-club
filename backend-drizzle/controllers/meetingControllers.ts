import { Request, Response } from "express";
import { eq, and, inArray, desc, count } from "drizzle-orm";
import { db } from "../db/client";
import { meeting, clubBook, book } from "../db/schema";
import { MeetingStatus } from "../enums/meetingStatus";
import { BookStatus } from "../enums/bookStatus";
import { createId } from "../utils/id";

export const getMeetingsFromClub = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(401).json({ message: "Clube não selecionado" });
  }

  try {
    const meetingsList = await db.query.meeting.findMany({
      where: (m, { eq }) => eq(m.clubId, id),
      orderBy: (m, { desc }) => [desc(m.meetingDate), desc(m.meetingTime)],
      columns: {
        id: true,
        status: true,
        location: true,
        description: true,
        meetingDate: true,
        meetingTime: true,
      },
      with: {
        book: {
          columns: {
            id: true,
            title: true,
            author: true,
            coverUrl: true,
          },
        },
      },
    });

    const formatted = meetingsList.map((m) => ({
      id: m.id,
      status: m.status,
      location: m.location,
      description: m.description,
      meetingDate: m.meetingDate,
      meetingTime: m.meetingTime,
      book: m.book
        ? {
            id: m.book.id,
            title: m.book.title,
            author: m.book.author,
            coverUrl: m.book.coverUrl,
          }
        : null,
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erro ao buscar reuniões" });
  }
};

export const getPastMeetingsFromClub = async (req: Request, res: Response) => {
  const { id } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 4;

  if (!id) {
    return res.status(401).json({ message: "Clube não selecionado" });
  }

  try {
    const skip = (page - 1) * limit;

    const [meetingsList, countResult] = await Promise.all([
      db.query.meeting.findMany({
        where: (m, { eq, and, inArray }) =>
          and(
            eq(m.clubId, id),
            inArray(m.status, [
              MeetingStatus.COMPLETED,
              MeetingStatus.CANCELLED,
            ])
          ),
        orderBy: (m, { desc }) => [desc(m.meetingDate), desc(m.meetingTime)],
        offset: skip,
        limit,
        columns: {
          id: true,
          status: true,
          location: true,
          description: true,
          meetingDate: true,
          meetingTime: true,
          createdAt: true,
        },
        with: {
          book: {
            columns: {
              id: true,
              title: true,
              author: true,
              coverUrl: true,
            },
          },
        },
      }),
      db
        .select({ value: count() })
        .from(meeting)
        .where(
          and(
            eq(meeting.clubId, id),
            inArray(meeting.status, [
              MeetingStatus.COMPLETED,
              MeetingStatus.CANCELLED,
            ])
          )
        ),
    ]);

    const totalItems = Number((countResult[0] as any)?.value ?? 0);
    const totalPages = Math.ceil(totalItems / limit);

    const data = meetingsList.map((m) => ({
      id: m.id,
      status: m.status,
      location: m.location,
      description: m.description,
      meetingDate: m.meetingDate,
      meetingTime: m.meetingTime,
      createdAt: m.createdAt,
      book: (m as any).book
        ? {
            id: (m as any).book.id,
            title: (m as any).book.title,
            author: (m as any).book.author,
            coverUrl: (m as any).book.coverUrl,
          }
        : null,
    }));

    return res.status(200).json({
      data,
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
    const [newMeeting] = await db
      .insert(meeting)
      .values({
        id: createId(),
        location,
        description: description ?? null,
        meetingDate: new Date(meetingDate),
        meetingTime: meetingTime,
        bookId,
        clubId,
        status: MeetingStatus.SCHEDULED,
      })
      .returning();

    if (!newMeeting) {
      return res.status(500).json({ message: "Erro ao criar encontro" });
    }

    const [clubBookEntry] = await db
      .select()
      .from(clubBook)
      .where(
        and(
          eq(clubBook.bookId, bookId),
          eq(clubBook.clubId, clubId)
        )
      )
      .limit(1);

    if (clubBookEntry && clubBookEntry.status !== BookStatus.STARTED) {
      await db
        .update(clubBook)
        .set({ status: BookStatus.STARTED })
        .where(eq(clubBook.id, clubBookEntry.id));
    }

    res.status(200).json({
      message: "Encontro marcado com sucesso!",
      meeting: newMeeting,
    });
  } catch (error: any) {
    if (error?.code === "23503") {
      return res
        .status(404)
        .json({ message: "Registro não encontrado para atualizar" });
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
    const [updatedMeeting] = await db
      .update(meeting)
      .set({
        location,
        description: description ?? null,
        meetingDate: new Date(meetingDate),
        meetingTime,
        bookId,
        clubId,
        status,
      })
      .where(eq(meeting.id, id))
      .returning();

    if (!updatedMeeting) {
      return res.status(404).json({ message: "Encontro não encontrado" });
    }

    if (status === MeetingStatus.COMPLETED) {
      const [clubBookEntry] = await db
        .select()
        .from(clubBook)
        .where(
          and(
            eq(clubBook.bookId, bookId),
            eq(clubBook.clubId, clubId)
          )
        )
        .limit(1);

      if (clubBookEntry) {
        await db
          .update(clubBook)
          .set({ status: BookStatus.FINISHED })
          .where(eq(clubBook.id, clubBookEntry.id));
      }
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

export const cancelMeeting = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    res
      .status(400)
      .json({ message: "Id deve ser enviado para cancelar o encontro!" });
    return;
  }

  try {
    const [updatedMeeting] = await db
      .update(meeting)
      .set({ status: MeetingStatus.CANCELLED })
      .where(eq(meeting.id, id))
      .returning();

    if (!updatedMeeting) {
      return res.status(404).json({ message: "Encontro não encontrado" });
    }

    res.status(200).json({
      message: "Encontro cancelado com sucesso",
      meeting: updatedMeeting,
    });
  } catch (error: any) {
    if (error?.code === "23503") {
      return res.status(404).json({ message: "Encontro não encontrado" });
    }
    console.error(error);
    res.status(500).json({ message: "Erro ao cancelar encontro" });
  }
};
