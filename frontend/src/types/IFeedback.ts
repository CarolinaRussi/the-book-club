import type { FeedbackType } from "../utils/constants/feedback";

export interface ICreateFeedbackData {
  type: FeedbackType;
  message: string;
  pageUrl: string;
}

export interface ICreateFeedbackResponse {
  message: string;
  feedback: {
    id: string;
    type: FeedbackType;
    createdAt: string;
  };
}
