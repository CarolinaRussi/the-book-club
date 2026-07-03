import { api } from "../index";
import type { IUserProfileResponse } from "@/types/IUserProfile";

export const fetchUserProfile = async (
  userId: string,
): Promise<IUserProfileResponse> => {
  const { data } = await api.get(`/users/${userId}/profile`);
  return data;
};
