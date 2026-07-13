export const FEEDBACK_TYPE_VALUES = ["bug", "idea", "other"] as const;

export type FeedbackType = (typeof FEEDBACK_TYPE_VALUES)[number];

export const feedbackTypeLabels: Record<FeedbackType, string> = {
  bug: "Bug",
  idea: "Ideia",
  other: "Outro",
};

export const FEEDBACK_MESSAGE_MAX_LENGTH = 2000;
