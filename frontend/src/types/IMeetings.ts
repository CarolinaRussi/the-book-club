import type { MeetingStatus } from "../utils/constants/meeting";
import type { IBook } from "./IBooks";

export interface IMeetingRecap {
  id: string;
  text: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IMeeting {
  id: string;
  location: string;
  description: string;
  meetingDate: string;
  meetingTime: string;
  chapterStart?: number | null;
  chapterEnd?: number | null;
  status: MeetingStatus;
  createdAt: string;
  book: IBook | null;
  googleEventId?: string | null;
  googleSyncError?: string | null;
  recap?: IMeetingRecap | null;
}

export interface IPendingMeetingRecap {
  id: string;
  meetingDate: string;
  meetingTime: string;
  location: string;
  description: string | null;
  club: {
    id: string;
    name: string;
  };
  book: IBook | null;
}

export interface IMeetingCreatePayload {
  location: string;
  description?: string;
  meetingDate: string;
  meetingTime: string;
  chapterStart?: number | null;
  chapterEnd?: number | null;
  totalChapters?: number | null;
  bookId?: string | null;
  clubId: string;
}

export interface IMeetingUpdatePayload {
  id: string;
  location: string;
  description?: string;
  meetingDate: string;
  meetingTime: string;
  chapterStart?: number | null;
  chapterEnd?: number | null;
  totalChapters?: number | null;
  status: MeetingStatus;
  bookId?: string | null;
  clubId: string;
}
