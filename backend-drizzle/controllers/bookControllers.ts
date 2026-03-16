import { Request, Response } from "express";
import { eq, and, or, ilike, desc, inArray, count } from "drizzle-orm";
import { v2 as cloudinary } from "cloudinary";
import { db } from "../db/client";
import { book, clubBook, userBook, review, user, member } from "../db/schema";
import { BookStatus } from "../enums/bookStatus";
import { BookCreateInput } from "../types/IBook";
import { uploadToCloudinary } from "../utils/cloudinary";
import { createId } from "../utils/id";

export const createBook = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const clubId = req.body.clubId ?? req.body.club_id;
    if (!clubId) {
      return res.status(400).json({ message: "clubId é obrigatório." });
    }
    const openLibraryId = req.body.id;
    const coverUrlOpenLibrary = req.body.coverUrlOpenLibrary ?? req.body.cover_url_open_library;
    const { title, author } = req.body;

    const bookPayload: Partial<BookCreateInput> = {
      title,
      author,
      openLibraryId: openLibraryId ?? "",
      coverUrl: coverUrlOpenLibrary ?? "",
    };

    let uploadResult: any;

    if (file) {
      uploadResult = await uploadToCloudinary(file.buffer);
    } else if (coverUrlOpenLibrary) {
      uploadResult = await cloudinary.uploader.upload(coverUrlOpenLibrary, {
        folder: "book_covers_project",
        public_id: openLibraryId ? `book_${openLibraryId}` : undefined,
      });
    }

    if (uploadResult) {
      bookPayload.coverUrl = uploadResult.secure_url;
      bookPayload.coverPublicId = uploadResult.public_id;
    }

    const newClubBookEntry = await db.transaction(async (tx) => {
      let bookRecord: typeof book.$inferSelect | undefined;

      if (openLibraryId) {
        const existing = await tx
          .select()
          .from(book)
          .where(or(eq(book.openLibraryId, openLibraryId), eq(book.id, openLibraryId)))
          .limit(1);
        bookRecord = existing[0];
      }

      if (!bookRecord) {
        const [created] = await tx
          .insert(book)
          .values({
            id: createId(),
            title: bookPayload.title!,
            author: bookPayload.author,
            openLibraryId: bookPayload.openLibraryId,
            coverUrl: bookPayload.coverUrl,
            coverPublicId: bookPayload.coverPublicId,
          })
          .returning();
        bookRecord = created!;
      }

      const existingLink = await tx
        .select()
        .from(clubBook)
        .where(
          and(
            eq(clubBook.clubId, clubId),
            eq(clubBook.bookId, bookRecord.id),
            eq(clubBook.status, BookStatus.SUGGESTED)
          )
        )
        .limit(1);

      if (existingLink.length > 0) {
        throw new Error("Este livro já foi adicionado a este clube.");
      }

      const [clubBookLink] = await tx
        .insert(clubBook)
        .values({
          id: createId(),
          clubId,
          bookId: bookRecord.id,
          status: BookStatus.SUGGESTED,
        })
        .returning();

      return clubBookLink!;
    });

    res
      .status(201)
      .json({ message: "Livro criado com sucesso!", book: newClubBookEntry });
  } catch (error: any) {
    if (error?.message === "Este livro já foi adicionado a este clube.") {
      return res.status(400).json({ message: error.message });
    }
    console.error("Erro ao criar o livro:", error);
    res.status(500).json({ message: "Erro interno ao criar o livro" });
  }
};

export const getBooksByClubId = async (req: Request, res: Response) => {
  const { clubId } = req.params;
  const page = req.query.page ? Number(req.query.page) : undefined;
  const limit = req.query.limit ? Number(req.query.limit) : undefined;
  const userId = req.userId;

  if (!clubId) {
    return res.status(400).json({ message: "ID do Clube não enviado." });
  }

  try {
    const clubBooksBase = await db
      .select()
      .from(clubBook)
      .where(eq(clubBook.clubId, clubId))
      .orderBy(desc(clubBook.addedAt));

    const clubBooksPaginated =
      page !== undefined && limit !== undefined
        ? clubBooksBase.slice((page - 1) * limit, page * limit)
        : clubBooksBase;

    const bookIds = clubBooksPaginated.map((cb) => cb.bookId);
    if (bookIds.length === 0) {
      if (page !== undefined && limit !== undefined) {
        const totalItems = clubBooksBase.length;
        return res.status(200).json({
          data: [],
          totalPages: Math.ceil(totalItems / limit),
          currentPage: page,
          totalItems,
        });
      }
      return res.status(200).json([]);
    }

    const booksList = await db
      .select()
      .from(book)
      .where(inArray(book.id, bookIds));

    const booksMap = new Map(booksList.map((b) => [b.id, b]));

    const allReviews = await db
      .select({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        userId: review.userId,
        bookId: review.bookId,
        userName: user.name,
        userNickname: user.nickname,
        userProfilePicture: user.profilePicture,
        userIdFull: user.id,
      })
      .from(review)
      .innerJoin(user, eq(review.userId, user.id))
      .innerJoin(member, eq(member.userId, user.id))
      .where(and(eq(member.clubId, clubId), inArray(review.bookId, bookIds)));

    const userBooksForUser = userId
      ? await db
          .select()
          .from(userBook)
          .where(
            and(eq(userBook.userId, userId), inArray(userBook.bookId, bookIds))
          )
      : [];

    const userBooksMap = new Map(
      userBooksForUser.map((ub) => [`${ub.userId}-${ub.bookId}`, ub])
    );

    const formattedData = clubBooksPaginated.map((cb) => {
      const b = booksMap.get(cb.bookId);
      if (!b) return null;
      const bookReviews = allReviews.filter((r) => r.bookId === b.id);
      const formattedReviews = bookReviews.map((r) => {
        const ub = userBooksMap.get(`${r.userId}-${b.id}`);
        return {
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          readingStatus: ub?.readingStatus ?? "not_started",
          user: {
            id: r.userIdFull,
            name: r.userName,
            nickname: r.userNickname,
            profilePicture: r.userProfilePicture,
          },
        };
      });
      const isInLibrary = userId
        ? userBooksForUser.some((ub) => ub.bookId === b.id)
        : false;
      return {
        ...b,
        status: cb.status,
        addedAt: cb.addedAt,
        reviews: formattedReviews,
        isInLibrary,
      };
    }).filter(Boolean);

    if (page !== undefined && limit !== undefined) {
      const totalItems = clubBooksBase.length;
      return res.status(200).json({
        data: formattedData,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        totalItems,
      });
    }
    return res.status(200).json(formattedData);
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

    const userBooksData = await db.query.userBook.findMany({
      where: (ub, { eq }) => eq(ub.userId, userId),
      orderBy: (ub, { desc }) => [desc(ub.updatedAt)],
      offset: skip,
      limit,
      with: {
        book: {
          columns: {
            id: true,
            title: true,
            author: true,
            coverUrl: true,
          },
          with: {
            reviews: {
              where: (r, { eq }) => eq(r.userId, userId),
              columns: { id: true, rating: true, comment: true },
            },
          },
        },
      },
      columns: { id: true, updatedAt: true, readingStatus: true },
    });

    const [{ value: totalItems }] = await db
      .select({ value: count() })
      .from(userBook)
      .where(eq(userBook.userId, userId));

    const totalPages = Math.ceil(Number(totalItems ?? 0) / limit);

    const data = userBooksData.map((ub) => ({
      id: ub.id,
      updatedAt: ub.updatedAt,
      readingStatus: ub.readingStatus,
      book: ub.book
        ? {
            id: ub.book.id,
            title: ub.book.title,
            author: ub.book.author,
            coverUrl: ub.book.coverUrl,
            reviews: (ub.book as any).reviews ?? [],
          }
        : null,
    }));

    return res
      .status(200)
      .json({ data, totalPages, currentPage: page, totalItems: Number(totalItems ?? 0) });
  } catch (error) {
    console.error("Erro ao buscar livros do usuário:", error);
    res.status(500).json({ message: "Erro interno ao buscar membros" });
  }
};

export const saveReview = async (req: Request, res: Response) => {
  try {
    const readingStatus = req.body.readingStatus ?? req.body.reading_status;
    const { userId, clubId, bookId, rating, comment } = req.body;

    if (!clubId || !userId || !bookId || !readingStatus) {
      return res.status(400).json({
        message: "Dados incompletos. userId, bookId e status são obrigatórios.",
      });
    }

    const [memberRow] = await db
      .select()
      .from(member)
      .where(
        and(eq(member.userId, userId), eq(member.clubId, clubId))
      )
      .limit(1);

    if (!memberRow) {
      return res.status(404).json({
        message:
          "Não foi possível encontrar sua matrícula neste clube para avaliar este livro.",
      });
    }

    const result = await db.transaction(async (tx) => {
      const existingUserBook = await tx
        .select()
        .from(userBook)
        .where(
          and(
            eq(userBook.userId, userId),
            eq(userBook.bookId, bookId)
          )
        )
        .limit(1);

      let savedUserBook: typeof userBook.$inferSelect;
      if (existingUserBook.length > 0) {
        const [updated] = await tx
          .update(userBook)
          .set({ readingStatus })
          .where(eq(userBook.id, existingUserBook[0].id))
          .returning();
        savedUserBook = updated!;
      } else {
        const [inserted] = await tx
          .insert(userBook)
          .values({
            id: createId(),
            userId,
            bookId,
            readingStatus,
          })
          .returning();
        savedUserBook = inserted!;
      }

      const existingReview = await tx
        .select()
        .from(review)
        .where(
          and(eq(review.userId, userId), eq(review.bookId, bookId))
        )
        .limit(1);

      let savedReview: typeof review.$inferSelect;
      if (existingReview.length > 0) {
        const [updated] = await tx
          .update(review)
          .set({
            rating: rating ? Number(rating) : null,
            comment: comment ?? null,
          })
          .where(eq(review.id, existingReview[0].id))
          .returning();
        savedReview = updated!;
      } else {
        const [inserted] = await tx
          .insert(review)
          .values({
            id: createId(),
            userId,
            bookId,
            rating: rating ? Number(rating) : null,
            comment: comment ?? null,
          })
          .returning();
        savedReview = inserted!;
      }

      return { savedUserBook, savedReview };
    });

    return res.status(201).json({
      message: "Avaliação salva com sucesso!",
      review: result.savedReview,
      userBookStatus: result.savedUserBook.readingStatus,
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
    const searchPattern = `%${q}%`;
    const books = await db
      .select({
        id: book.id,
        title: book.title,
        author: book.author,
        coverUrl: book.coverUrl,
      })
      .from(book)
      .where(
        or(
          ilike(book.title, searchPattern),
          ilike(book.author ?? "", searchPattern)
        )
      )
      .limit(10);

    res.status(200).json(
      books.map((b) => ({
        id: b.id,
        title: b.title,
        author: b.author,
        coverUrl: b.coverUrl,
      }))
    );
  } catch (error) {
    console.error("Erro ao buscar livros:", error);
    res.status(500).json({ message: "Erro interno ao buscar livros" });
  }
};
