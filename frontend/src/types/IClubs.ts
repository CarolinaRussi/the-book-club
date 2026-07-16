import type {
  ClubJoinPolicy,
  ClubReadingMode,
  ClubStatus,
  ClubVisibility,
  MeetingFormat,
} from "../utils/constants/clubs";
import type { IUser } from "./IUser";

export interface IClub {
  id: string;
  name: string;
  status: ClubStatus;
  ownerId: string;
  invitationCode: string;
  createdAt: string;
  description?: string;
  readingMode: ClubReadingMode;
  visibility: ClubVisibility;
  joinPolicy: ClubJoinPolicy;
  meetingFormat: MeetingFormat | null;
  stateId: number | null;
  cityId: number | null;
}

export interface IClubWithOwner extends IClub {
  user: {
    name: string;
  };
}

export interface IClubInvitePreview {
  id: string;
  name: string;
  description: string;
  user: {
    name: string;
  } | null;
}

export interface IClubPayload {
  name: string;
  ownerId?: string;
  description: string;
  visibility: ClubVisibility;
  joinPolicy?: ClubJoinPolicy;
  meetingFormat: MeetingFormat;
  stateId: number;
  cityId: number;
}

export interface IEditClubPayload {
  id: string;
  name: string;
  description: string;
  invitationCode: string;
  readingMode: ClubReadingMode;
  visibility: ClubVisibility;
  joinPolicy: ClubJoinPolicy;
  meetingFormat: MeetingFormat | null;
  stateId: number | null;
  cityId: number | null;
}

export interface IMembersClub {
  id: string;
  joined_at: string;
  user_id: string;
  user: IUser;
}

export interface IUserClub {
  id: string;
  name: string;
  description: string;
  invitationCode: string;
  createdAt: string;
  ownerId: string;
  status: ClubStatus;
  readingMode: ClubReadingMode;
  visibility: ClubVisibility;
  joinPolicy: ClubJoinPolicy;
  meetingFormat: MeetingFormat | null;
  stateId: number | null;
  cityId: number | null;
  member: IMembersClub[];
}

export interface IState {
  id: number;
  code: string;
  name: string;
}

export interface ICity {
  id: number;
  name: string;
  stateId: number;
}

export interface IDiscoverClub {
  id: string;
  name: string;
  description: string;
  joinPolicy: ClubJoinPolicy;
  meetingFormat: MeetingFormat | null;
  createdAt: string;
  memberCount: number;
  isMember: boolean;
  state: {
    id: number;
    code: string;
    name: string;
  } | null;
  city: {
    id: number;
    name: string;
  } | null;
}

export interface IDiscoverClubsResponse {
  data: IDiscoverClub[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}
