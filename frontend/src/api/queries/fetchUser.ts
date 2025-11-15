import { api } from "../index";
import type { IUser } from "../../types/IUser";

export const fetchAuthenticatedUser = async (): Promise<IUser> => {
  const { data } = await api.get("/me/user");
  return data;
};
