import { Request, Response } from "express";
import * as locationService from "../../services/locationService";

export const listCities = async (req: Request, res: Response) => {
  const stateId = Number(req.params.stateId);
  const searchQuery =
    typeof req.query.q === "string" ? req.query.q : undefined;

  if (!Number.isInteger(stateId) || stateId <= 0) {
    res.status(400).json({ message: "Estado inválido." });
    return;
  }

  try {
    const cities = await locationService.listCitiesByStateId(
      stateId,
      searchQuery,
    );
    if (cities === null) {
      res.status(404).json({ message: "Estado não encontrado." });
      return;
    }
    res.status(200).json({ data: cities });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao listar cidades" });
  }
};
