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
  books: IBook[];
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
  books: IBook[];
}

export interface IMeetingCreatePayload {
  location: string;
  description?: string;
  meetingDate: string;
  meetingTime: string;
  chapterStart?: number | null;
  chapterEnd?: number | null;
  totalChapters?: number | null;
  bookIds?: string[];
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
  bookIds?: string[];
  clubId: string;
}
