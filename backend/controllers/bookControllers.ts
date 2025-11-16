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
    const { title, author, club_id, open_library_id, cover_url } = req.body;

    const bookPayload: BookCreateInput = {
      title: title,
      author: author,
      open_library_id: open_library_id,
      cover_url: cover_url,
    };

    let uploadResult;

    if (file) {
      console.log("Enviando arquivo (buffer) para o Cloudinary...");
      uploadResult = await uploadToCloudinary(file.buffer);
    } else if (cover_url) {
      console.log(`Enviando URL (${cover_url}) para o Cloudinary...`);

      uploadResult = await cloudinary.uploader.upload(cover_url, {
        folder: "book_covers_project",
        public_id: open_library_id ? `book_${open_library_id}` : undefined,
      });
    }

    if (uploadResult) {
      console.log("Upload bem-sucedido:", uploadResult.secure_url);
      bookPayload.cover_url = uploadResult.secure_url;
      bookPayload.cover_public_id = uploadResult.public_id;
    }

    const newClubBookEntry = await db.$transaction(async (tx) => {
      let book;

      if (open_library_id) {
        book = await tx.book.findFirst({
          where: { open_library_id: open_library_id },
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

  if (!clubId) {
    return res.status(400).json({ message: "ID do Clube não enviado." });
  }

  try {
    const booksInClub = await db.clubBook.findMany({
      where: {
        club_id: clubId,
      },
      select: {
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
      },
    });

    const formattedResponse = booksInClub.map((cb) => ({
      ...cb.book,
      status: cb.status,
      added_at: cb.added_at,
    }));

    res.status(200).json(formattedResponse);
  } catch (error) {
    console.error("Erro ao buscar livros do clube:", error);
    res.status(500).json({ message: "Erro interno ao buscar livros do clube" });
  }
};

export const saveReview = async (req: Request, res: Response) => {
  try {
    const { userId, bookId, rating, review, reading_status } = req.body;

    if (!userId || !bookId || !reading_status) {
      return res.status(400).json({
        message: "Dados incompletos. userId, bookId e status são obrigatórios.",
      });
    }

    const clubWithMemberAndBook = await db.club.findFirst({
      where: {
        books: {
          some: { book_id: bookId },
        },
        member: {
          some: { user_id: userId },
        },
      },
      include: {
        member: {
          where: { user_id: userId },
          select: { id: true },
        },
      },
    });

    if (!clubWithMemberAndBook || !clubWithMemberAndBook.member[0]) {
      return res.status(404).json({
        message:
          "Não foi possível encontrar sua matrícula neste clube para avaliar este livro.",
      });
    }

    const memberId = clubWithMemberAndBook.member[0].id;

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
