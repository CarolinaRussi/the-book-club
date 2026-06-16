import type { IPaginatedResponse } from "@/types/IApi";
import type { IFeedActivity } from "@/types/IFeed";
import { api } from "../index";

export const fetchMyFeed = async (
  page: number = 1,
  limit: number = 20
): Promise<IPaginatedResponse<IFeedActivity>> => {
  const { data } = await api.get("/me/feed", {
    params: { page, limit },
  });
  return data;
};
