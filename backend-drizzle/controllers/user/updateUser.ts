import { Request, Response } from "express";
import * as userService from "../../services/userService";

export const updateUser = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const removeProfilePicture =
      req.body.removeProfilePicture ?? req.body.remove_profile_picture;
    const {
      id,
      remove_profile_picture: _rp1,
      removeProfilePicture: _rp2,
      ...otherData
    } = req.body;

    const result = await userService.updateUserProfile({
      id,
      file,
      removeProfilePicture,
      otherData,
    });

    if (!result.ok) {
      if (result.reason === "not_found") {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      return res.status(500).json({ message: "Erro ao atualizar perfil" });
    }

    res.status(200).json({
      message: "Perfil atualizado!",
      user: result.user,
    });
  } catch (error) {
    console.error("Erro ao atualizar o perfil:", error);
    res.status(500).json({ message: "Erro interno ao atualizar perfil" });
  }
};
