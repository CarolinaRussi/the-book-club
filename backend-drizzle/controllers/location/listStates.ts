import { Request, Response } from "express";
import * as locationService from "../../services/locationService";

export const listStates = async (_req: Request, res: Response) => {
  try {
    const states = await locationService.listStates();
    res.status(200).json({ data: states });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao listar estados" });
  }
};
