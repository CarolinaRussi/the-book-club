import { Request, Response } from "express";
import { db } from "../db/client";
import { v2 as cloudinary } from "cloudinary";
import { uploadToCloudinary } from "../utils/cloudinary";
import { BookStatus } from "../enums/bookStatus";
import { BookCreateInput } from "../types/IBook";

export const createBook = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const { title, author, club_id, open_library_id, cover_url } = req.body;

    const bookData: BookCreateInput = {
      title: title,
      author: author,
      club_id: club_id,
      open_library_id: open_library_id,
      cover_url: cover_url,
      status: BookStatus.STARTED,
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
      bookData.cover_url = uploadResult.secure_url;
      bookData.cover_public_id = uploadResult.public_id;
    }

    const createBook = await db.book.create({
      data: bookData,
    });
    res
      .status(201)
      .json({ message: "Livro criado com sucesso!", book: createBook });
  } catch (error) {
    console.error("Erro ao criar o livro:", error);
    res.status(500).json({ message: "Erro interno ao criar o livro" });
  }
};

export const getBooksByClubId = async (req: Request, res: Response) => {
  const { clubId } = req.params;

  if (!clubId) {
    return res.status(401).json({ message: "Codigo de Convite não enviado." });
  }

  try {
    const book = await db.book.findMany({
      where: {
        club_id: clubId,
      },
      select: {
        id: true,
        title: true,
        author: true,
        cover_url: true,
        status: true,
        created_at: true,
        review: {
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
                  },
                },
              },
            },
          },
        },
      },
    });

    res.status(200).json(book);
  } catch (error) {
    console.error("Erro ao buscar clube por código de convite:", error);
    res
      .status(500)
      .json({ message: "Erro interno ao buscar clubes por código de convite" });
  }
};
