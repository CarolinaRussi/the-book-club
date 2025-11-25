import type { MeetingStatus } from "../utils/constants/meeting";
import type { IBook } from "./IBooks";

export interface IMeeting {
  id: string;
  location: string;
  description: string;
  meeting_date: string;
  meeting_time: string;
  status: MeetingStatus;
  created_at: string;
  book: IBook;
}

export interface IMeetingCreatePayload {
  location: string;
  description?: string;
  meetingDate: Date;
  meetingTime: Date;
  bookId: string;
  clubId: string;
}

export interface IMeetingUpdatePayload {
  id: string;
  location: string;
  description?: string;
  meetingDate: Date;
  meetingTime: Date;
  status: MeetingStatus;
  bookId: string;
  clubId: string;
}