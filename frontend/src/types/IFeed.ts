import type { ReadingStatus } from "@/utils/constants/reading";

export type FeedActivityType = "finished";

export interface IFeedActivityActor {
  id: string;
  name: string;
  nickname: string;
  profilePicture: string | null;
}

export interface IFeedActivityBook {
  id: string;
  title: string;
  author: string | null;
  coverUrl: string | null;
}

export interface IFeedActivity {
  id: string;
  type: FeedActivityType;
  updatedAt: string;
  actor: IFeedActivityActor;
  isOwnActivity: boolean;
  book: IFeedActivityBook;
  readingStatus: ReadingStatus;
  rating: number | null;
  comment: string | null;
}
