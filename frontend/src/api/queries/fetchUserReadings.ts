import { api } from "../index";
import type { IPaginatedResponse } from "@/types/IApi";
import type { IUserBook } from "@/types/IBooks";

export const fetchUserProfileReadings = async (
  userId: string,
  page: number = 1,
  itemsPerPage: number = 15,
): Promise<IPaginatedResponse<IUserBook>> => {
  const { data } = await api.get(`/users/${userId}/readings`, {
    params: {
      page,
      limit: itemsPerPage,
      status: "finished",
    },
  });
  return data;
};
