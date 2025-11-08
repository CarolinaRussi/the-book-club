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

    if (file) {
      console.log("Enviando arquivo para o Cloudinary...");
      const uploadResult = await uploadToCloudinary(file.buffer);

      console.log(uploadResult.secure_url);
      console.log(uploadResult.public_id);

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
