import { IReaders } from "../../types/IReaders";
import { api } from "../index";

export const fetchReadersByClubId = async (
  clubId: string | null
): Promise<IReaders[]> => {
  const { data } = await api.get(`/club/${clubId}/readers`);
  return data;
};
