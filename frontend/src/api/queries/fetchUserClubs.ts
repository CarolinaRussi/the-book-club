import { IUserClub } from "../../types/IClubs";
import { api } from "../index";

export const fetchUserClubs = async (): Promise<IUserClub[]> => {
  const { data } = await api.get("/me/clubs");
  return data;
};
