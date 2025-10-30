import { UserClub } from "../../types/IClubs";
import { api } from "../index";

export const fetchUserClubs = async (): Promise<UserClub[]> => {
  const { data } = await api.get("/me/clubs");
  return data;
};
