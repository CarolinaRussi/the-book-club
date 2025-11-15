import type { IMeeting } from "../../types/IMeetings";
import { api } from "../index";

export const fetchMeetingsByClubId = async (
  clubId: string | null
): Promise<IMeeting[]> => {
  const { data } = await api.get(`/club/${clubId}/meetings`);
  return data;
};
