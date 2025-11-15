import type { IClub } from "../../types/IClubs";
import { api } from "../index";

export const fetchUserClubs = async (): Promise<IClub[]> => {
  const { data } = await api.get("/me/clubs");
  return data;
};
