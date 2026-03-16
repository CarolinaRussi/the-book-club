import { Request, Response } from "express";
import { and, eq } from "drizzle-orm";
import { db } from "../db/client";
import { user, userBook } from "../db/schema";
import { v2 as cloudinary } from "cloudinary";
import { uploadToCloudinary } from "../utils/cloudinary";
import { createId } from "../utils/id";

export const updateUser = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const removeProfilePicture = req.body.removeProfilePicture ?? req.body.remove_profile_picture;
    const { id, remove_profile_picture: _rp1, removeProfilePicture: _rp2, ...otherData } = req.body;

    const [foundUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, id))
      .limit(1);

    if (!foundUser) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const updateData: Record<string, any> = { ...otherData };

    const oldPublicId = foundUser.profilePicturePublicId;

    if (removeProfilePicture === "true" || removeProfilePicture === true) {
      if (oldPublicId) {
        await cloudinary.uploader.destroy(oldPublicId);
      }
      updateData.profilePicture = null;
      updateData.profilePicturePublicId = null;
    } else if (file) {
      const uploadResult = await uploadToCloudinary(file.buffer);
      updateData.profilePicture = uploadResult.secure_url;
      updateData.profilePicturePublicId = uploadResult.public_id;
      if (oldPublicId) {
        await cloudinary.uploader.destroy(oldPublicId);
      }
    }

    const [updatedUser] = await db
      .update(user)
      .set(updateData)
      .where(eq(user.id, id))
      .returning();

    if (!updatedUser) {
      return res.status(500).json({ message: "Erro ao atualizar perfil" });
    }

    const { password, ...userParaFront } = updatedUser;
    res
      .status(200)
      .json({ message: "Perfil atualizado!", user: userParaFront });
  } catch (error) {
    console.error("Erro ao atualizar o perfil:", error);
    res.status(500).json({ message: "Erro interno ao atualizar perfil" });
  }
};

export const getUserAuthenticated = async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ message: "Usuário não autenticado" });
  }

  try {
    const [foundUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!foundUser) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    res.status(200).json(foundUser);
  } catch (error) {
    console.error("Erro ao buscar usuário", error);
    res.status(500).json({ message: "Erro interno ao usuário" });
  }
};

export const updatePersonalLibrary = async (req: Request, res: Response) => {
  const { bookId, userId } = req.body;

  if (!bookId || !userId) {
    res.status(400).json({ message: "Id do livro ou de usuário inválido!" });
    return;
  }

  try {
    const existing = await db.query.userBook.findFirst({
      where: (ub, { and, eq }) =>
        and(eq(ub.userId, userId), eq(ub.bookId, bookId)),
    });

    if (existing) {
      await db.delete(userBook).where(eq(userBook.id, existing.id));
      return res.status(200).json({
        message: "Livro removido da biblioteca pessoal.",
        action: "removed",
      });
    }

    const [newUserBook] = await db
      .insert(userBook)
      .values({
        id: createId(),
        bookId,
        userId,
      })
      .returning();

    return res.status(201).json({
      message: "Livro adicionado à biblioteca pessoal com sucesso!",
      userBook: newUserBook,
      action: "added",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao atualizar a biblioteca pessoal" });
  }
};
