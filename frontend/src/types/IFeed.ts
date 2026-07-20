import type { ReadingStatus } from "@/utils/constants/reading";

export type FeedActivityType = "finished" | "meeting_recap";

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

export interface IFeedActivityClub {
  id: string;
  name: string;
}

export interface IFeedFinishedActivity {
  id: string;
  type: "finished";
  updatedAt: string;
  actor: IFeedActivityActor;
  isOwnActivity: boolean;
  book: IFeedActivityBook;
  clubs: IFeedActivityClub[];
  readingStatus: ReadingStatus;
  rating: number | null;
  comment: string | null;
}

export interface IFeedMeetingRecapActivity {
  id: string;
  type: "meeting_recap";
  createdAt: string;
  updatedAt: string;
  actor: IFeedActivityActor;
  isOwnActivity: boolean;
  club: IFeedActivityClub;
  meeting: {
    id: string;
    meetingDate: string;
    meetingTime: string;
    location: string;
  };
  books: IFeedActivityBook[];
  text: string | null;
  imageUrl: string | null;
}

export type IFeedActivity = IFeedFinishedActivity | IFeedMeetingRecapActivity;
