import type { IUpcomingMeetingsResponse } from "@/types/IUpcomingMeeting";
import { api } from "../index";

export const fetchMyUpcomingMeetings = async (
  limit: number = 5
): Promise<IUpcomingMeetingsResponse> => {
  const { data } = await api.get("/me/upcoming-meetings", {
    params: { limit },
  });
  return data;
};
