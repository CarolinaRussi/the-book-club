import type { IPaginatedResponse } from "@//types/IApi";
import type { IReaders } from "../../types/IReaders";
import { api } from "../index";

export const fetchReadersByClubId = async (
  clubId: string | null,
  page: number = 1,
  itemsPerPage: number = 8
): Promise<IPaginatedResponse<IReaders>> => {
  const { data } = await api.get(`/club/${clubId}/members`, {
    params: {
      page,
      limit: itemsPerPage,
    },
  });
  return data;
};
