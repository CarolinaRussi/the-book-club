import type { IMeeting, IPaginatedResponse } from "../../types/IMeetings";
import { api } from "../index";

export const fetchMeetingsByClubId = async (
  clubId: string | null
): Promise<IMeeting[]> => {
  const { data } = await api.get(`/club/${clubId}/meetings`);
  return data;
};

export const fetchPastMeetingsByClubId = async (
  clubId: string | null,
  page: number = 1,
  itemsPerPage: number = 3
): Promise<IPaginatedResponse<IMeeting>> => {
  const { data } = await api.get(`/club/${clubId}/meetings/past`, {
    params: {
      page,
      limit: itemsPerPage,
    },
  });
  return data;
};
