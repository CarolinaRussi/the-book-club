import { Request, Response } from "express";
import { db } from "../db/client";
import { v2 as cloudinary } from "cloudinary";
import { uploadToCloudinary } from "../utils/cloudinary";

export const updateUser = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const { id, remove_profile_picture, ...otherData } = req.body;

    const user = await db.user.findUnique({ where: { id: id } });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const updateData: any = { ...otherData };

    const oldPublicId = user.profile_picture_public_id;

    if (remove_profile_picture === "true") {
      if (oldPublicId) {
        await cloudinary.uploader.destroy(oldPublicId);
      }
      updateData.profile_picture = null;
      updateData.profile_picture_public_id = null;
    } else if (file) {
      console.log("Enviando arquivo para o Cloudinary...");
      const uploadResult = await uploadToCloudinary(file.buffer);

      updateData.profile_picture = uploadResult.secure_url;
      updateData.profile_picture_public_id = uploadResult.public_id;

      if (oldPublicId) {
        await cloudinary.uploader.destroy(oldPublicId);
      }
    }

    console.log("Dados a serem salvos no banco:", updateData);

    const updatedUser = await db.user.update({
      where: { id: id },
      data: updateData,
    });

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
    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
    });

    res.status(200).json(user);
  } catch (error) {
    console.error("Erro ao buscar clubes do usuário:", error);
    res.status(500).json({ message: "Erro interno ao buscar clubes" });
  }
};
