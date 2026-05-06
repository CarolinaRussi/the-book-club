import type { MeetingStatus } from "../utils/constants/meeting";
import type { IBook } from "./IBooks";

export interface IMeeting {
  id: string;
  location: string;
  description: string;
  meetingDate: string;
  meetingTime: string;
  status: MeetingStatus;
  createdAt: string;
  book: IBook | null;
}

export interface IMeetingCreatePayload {
  location: string;
  description?: string;
  meetingDate: string;
  meetingTime: string;
  bookId?: string | null;
  clubId: string;
}

export interface IMeetingUpdatePayload {
  id: string;
  location: string;
  description?: string;
  meetingDate: string;
  meetingTime: string;
  status: MeetingStatus;
  bookId?: string | null;
  clubId: string;
}