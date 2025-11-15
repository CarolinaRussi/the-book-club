import type { MeetingStatus } from "../types/IMeetings";

export const meetingStatusLabels: Record<MeetingStatus, string> = {
  scheduled: "Marcado",
  completed: "Realizado",
  cancelled: "Cancelado",
};
