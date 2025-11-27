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
        reviews: {
          where: {
            user: {
              member: {
                some: {
                  club_id: clubId,
                },
              },
            },
          },
          select: {
            id: true,
            rating: true,
            comment: true,
            user_id: true,
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
  };

  try {
    let booksInClubRaw;
    let totalItems = 0;

    if (page && limit) {
      const skip = (page - 1) * limit;
      const [count, data] = await db.$transaction([
        db.clubBook.count({ where: { club_id: clubId } }),
        db.clubBook.findMany({
          where: { club_id: clubId },
          orderBy: { added_at: "desc" },
          skip,
          take: limit,
          select: selectQuery,
        }),
      ]);
      totalItems = count;
      booksInClubRaw = data;
    } else {
      booksInClubRaw = await db.clubBook.findMany({
        where: { club_id: clubId },
        orderBy: { added_at: "desc" },
        select: selectQuery,
      });
      totalItems = booksInClubRaw.length;
    }

    const pairsToFetch: { userId: string; bookId: string }[] = [];

    booksInClubRaw.forEach((cb: any) => {
      cb.book.reviews.forEach((review: any) => {
        pairsToFetch.push({ userId: review.user_id, bookId: cb.book.id });
      });
    });

    const userBooks = await db.userBook.findMany({
      where: {
        OR: pairsToFetch.map((p) => ({
          user_id: p.userId,
          book_id: p.bookId,
        })),
      },
      select: {
        user_id: true,
        book_id: true,
        reading_status: true,
      },
    });

    const formattedData = booksInClubRaw.map((cb: any) => {
      const formattedReviews = cb.book.reviews.map((review: any) => {
        const foundStatus = userBooks.find(
          (ub) => ub.user_id === review.user_id && ub.book_id === cb.book.id
        );

        return {
          id: review.id,
          rating: review.rating,
          comment: review.comment,
          reading_status: foundStatus
            ? foundStatus.reading_status
            : "not_started",
          user: review.user,
        };
      });

      return {
        ...cb.book,
        status: cb.status,
        added_at: cb.added_at,
        review: formattedReviews,
      };
    });

    if (page && limit) {
      const totalPages = Math.ceil(totalItems / limit);
      return res.status(200).json({
        data: formattedData,
        totalPages,
        currentPage: page,
        totalItems,
      });
    } else {
      return res.status(200).json(formattedData);
    }
  } catch (error) {
    console.error("Erro ao buscar livros do clube:", error);
    return res
      .status(500)
      .json({ message: "Erro interno ao buscar livros do clube" });
  }
};

export const getBooksByUserId = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 8;

  if (!userId) {
    return res.status(401).json({ message: "Usuário não selecionado" });
  }

  try {
    const skip = (page - 1) * limit;

    const [books, totalItems] = await Promise.all([
      db.userBook.findMany({
        where: {
          user_id: userId,
        },
        orderBy: {
          updated_at: "desc",
        },
        skip,
        take: limit,
        select: {
          id: true,
          updated_at: true,
          reading_status: true,
          book: {
            select: {
              id: true,
              title: true,
              author: true,
              cover_url: true,
              reviews: {
                where: {
                  user_id: userId,
                },
                select: {
                  id: true,
                  rating: true,
                  comment: true,
                },
              },
            },
          },
        },
      }),
      db.userBook.count({
        where: {
          user_id: userId,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return res
      .status(200)
      .json({ data: books, totalPages, currentPage: page, totalItems });
  } catch (error) {
    console.error("Erro ao buscar membros do clube:", error);
    res.status(500).json({ message: "Erro interno ao buscar membros" });
  }
};

export const saveReview = async (req: Request, res: Response) => {
  try {
    const { userId, clubId, bookId, rating, comment, reading_status } =
      req.body;

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

    const result = await db.$transaction(async (tx) => {
      const savedUserBook = await tx.userBook.upsert({
        where: {
          user_id_book_id: {
            user_id: userId,
            book_id: bookId,
          },
        },
        update: {
          reading_status: reading_status,
        },
        create: {
          user_id: userId,
          book_id: bookId,
          reading_status: reading_status,
        },
      });

      const existingReview = await tx.review.findFirst({
        where: {
          user_id: userId,
          book_id: bookId,
        },
      });

      let savedReview;

      if (existingReview) {
        savedReview = await tx.review.update({
          where: { id: existingReview.id },
          data: {
            rating: rating ? Number(rating) : null,
            comment: comment,
            created_at: new Date(),
          },
        });
      } else {
        savedReview = await tx.review.create({
          data: {
            user_id: userId,
            book_id: bookId,
            rating: rating ? Number(rating) : null,
            comment: comment,
          },
        });
      }

      return { savedUserBook, savedReview };
    });

    return res.status(201).json({
      message: "Avaliação salva com sucesso!",
      review: result.savedReview,
      userBookStatus: result.savedUserBook.reading_status,
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
