export const ReadingDrawMode = {
  DIRECT: "direct",
  VOTE: "vote",
  LAST_STANDING: "last_standing",
} as const;

export type ReadingDrawModeValue =
  (typeof ReadingDrawMode)[keyof typeof ReadingDrawMode];
