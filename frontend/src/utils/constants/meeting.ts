export const MEETING_STATUS_VALUES = [
  "scheduled",
  "completed",
  "cancelled",
] as const;

export type MeetingStatus = (typeof MEETING_STATUS_VALUES)[number];

export const MEETING_STATUS_SCHEDULED: MeetingStatus = "scheduled";
export const MEETING_STATUS_COMPLETED: MeetingStatus = "completed";
export const MEETING_STATUS_CANCELLED: MeetingStatus = "cancelled";

export const meetingStatusLabels: Record<MeetingStatus, string> = {
  [MEETING_STATUS_SCHEDULED]: "Marcado",
  [MEETING_STATUS_COMPLETED]: "Realizado",
  [MEETING_STATUS_CANCELLED]: "Cancelado",
};
