export const MeetingFormat = {
  IN_PERSON: "in_person",
  REMOTE: "remote",
  HYBRID: "hybrid",
} as const;

export type MeetingFormatValue =
  (typeof MeetingFormat)[keyof typeof MeetingFormat];
