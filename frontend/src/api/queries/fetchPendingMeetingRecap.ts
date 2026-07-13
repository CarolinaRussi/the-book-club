import type { IPendingMeetingRecap } from "@/types/IMeetings";
import { api } from "../index";

export async function fetchPendingMeetingRecap(): Promise<{
  meeting: IPendingMeetingRecap | null;
}> {
  const { data } = await api.get("/me/pending-meeting-recap");
  return data;
}
