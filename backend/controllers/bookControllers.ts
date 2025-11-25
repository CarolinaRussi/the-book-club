import { Request, Response } from "express";
import { db } from "../db/client";
import { v2 as cloudinary } from "cloudinary";
import { uploadToCloudinary } from "../utils/cloudinary";
import { BookStatus } from "../enums/bookStatus";
import { BookCreateInput } from "../types/IBook";
import { ReadingStatus } from "../enums/readingStatus";

export const createBook = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const { title, author, club_id, id, cover_url_open_library } = req.body;

    const bookPayload: BookCreateInput = {
      title: title,
      author: author,
      open_library_id: id,
      cover_url: cover_url_open_library,
    };

    let uploadResult;

    if (file) {
      uploadResult = await uploadToCloudinary(file.buffer);
    } else if (cover_url_open_library) {
      uploadResult = await cloudinary.uploader.upload(cover_url_open_library, {
        folder: "book_covers_project",
        public_id: id ? `book_${id}` : undefined,
      });
    }

    if (uploadResult) {
      bookPayload.cover_url = uploadResult.secure_url;
      bookPayload.cover_public_id = uploadResult.public_id;
    }

    const newClubBookEntry = await db.$transaction(async (tx) => {
      let book;

      if (id) {
        book = await tx.book.findFirst({
          where: {
            OR: [{ open_library_id: id }, { id: id }],
          },
        });
      }

      if (!book) {
        book = await tx.book.create({
          data: bookPayload,
        });
      }

      const existingLink = await tx.clubBook.findFirst({
        where: {
          club_id: club_id,
          book_id: book.id,
          status: BookStatus.SUGGESTED,
        },
      });

      if (existingLink) {
        throw new Error("Este livro já foi adicionado a este clube.");
      }

      const clubBookLink = await tx.clubBook.create({
        data: {
          club_id: club_id,
          book_id: book.id,
          status: BookStatus.SUGGESTED,
        },
      });

      return clubBookLink;
    });
    res
      .status(201)
      .json({ message: "Livro criado com sucesso!", book: newClubBookEntry });
  } catch (error) {
    console.error("Erro ao criar o livro:", error);
    res.status(500).json({ message: "Erro interno ao criar o livro" });
  }
};

export const getBooksByClubId = async (req: Request, res: Response) => {
  const { clubId } = req.params;

  const page = req.query.page ? Number(req.query.page) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;

  if (!clubId) {
    return res.status(400).json({ message: "ID do Clube não enviado." });
  }

  const selectQuery = {
    status: true,
    added_at: true,
    book: {
      select: {
        id: true,
        title: true,
        author: true,
        cover_url: true,
        created_at: true,
        review: {
          where: {
            member: {
              club_id: clubId,
            },
          },
          select: {
            id: true,
            reading_status: true,
            rating: true,
            review: true,
            member: {
              select: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    nickname: true,
                    profile_picture: true,
                  },
                },
              },
            },
          },
        },
      },
    },
  };

  try {
    if (page && limit) {
      const skip = (page - 1) * limit;

      const [totalItems, booksInClub] = await db.$transaction([
        db.clubBook.count({
          where: { club_id: clubId },
        }),
        db.clubBook.findMany({
          where: { club_id: clubId },
          orderBy: { added_at: "desc" },
          skip: skip,
          take: limit,
          select: selectQuery,
        }),
      ]);

      const formattedData = booksInClub.map((cb: any) => ({
        ...cb.book,
        status: cb.status,
        added_at: cb.added_at,
      }));

      const totalPages = Math.ceil(totalItems / limit);

      return res.status(200).json({
        data: formattedData,
        totalPages,
        currentPage: page,
        totalItems,
      });
    } else {
      const booksInClub = await db.clubBook.findMany({
        where: { club_id: clubId },
        orderBy: { added_at: "desc" },
        select: selectQuery,
      });

      const formattedResponse = booksInClub.map((cb: any) => ({
        ...cb.book,
        status: cb.status,
        added_at: cb.added_at,
      }));

      return res.status(200).json(formattedResponse);
    }
  } catch (error) {
    console.error("Erro ao buscar livros do clube:", error);
    return res
      .status(500)
      .json({ message: "Erro interno ao buscar livros do clube" });
  }
};

export const saveReview = async (req: Request, res: Response) => {
  try {
    const { userId, clubId, bookId, rating, review, reading_status } = req.body;

    if (!clubId || !userId || !bookId || !reading_status) {
      return res.status(400).json({
        message: "Dados incompletos. userId, bookId e status são obrigatórios.",
      });
    }

    const memberWithBookAndClub = await db.member.findFirst({
      where: {
        user_id: userId,
        club_id: clubId,
      },
    });

    if (!memberWithBookAndClub) {
      return res.status(404).json({
        message:
          "Não foi possível encontrar sua matrícula neste clube para avaliar este livro.",
      });
    }

    const memberId = memberWithBookAndClub.id;

    const existingReview = await db.review.findFirst({
      where: {
        member_id: memberId,
        book_id: bookId,
      },
    });

    let savedReview;

    if (existingReview) {
      savedReview = await db.review.update({
        where: { id: existingReview.id },
        data: {
          rating: Number(rating),
          review: review,
          reading_status: reading_status as ReadingStatus,
          created_at: new Date(),
        },
      });
    } else {
      savedReview = await db.review.create({
        data: {
          member_id: memberId,
          book_id: bookId,
          rating: Number(rating),
          review: review,
          reading_status: reading_status as ReadingStatus,
        },
      });
    }

    return res.status(201).json({
      message: "Avaliação salva com sucesso!",
      review: savedReview,
    });
  } catch (error) {
    console.error("Erro ao salvar avaliação:", error);
    return res
      .status(500)
      .json({ message: "Erro interno ao processar a avaliação." });
  }
};

export const getBooksByTitleOrAuthor = async (req: Request, res: Response) => {
  const { q } = req.query;

  if (!q || typeof q !== "string") {
    return res.status(200).json([]);
  }

  try {
    const books = await db.book.findMany({
      where: {
        OR: [
          {
            title: {
              contains: q,
              mode: "insensitive",
            },
          },
          {
            author: {
              contains: q,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        author: true,
        cover_url: true,
      },
      take: 10,
    });

    res.status(200).json(books);
  } catch (error) {
    console.error("Erro ao buscar livros:", error);
    res.status(500).json({ message: "Erro interno ao buscar livros" });
  }
};
