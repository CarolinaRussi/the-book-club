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
  latitude: number | null;
  longitude: number | null;
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
  hasPendingRequest: boolean;
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

export interface IJoinRequest {
  id: string;
  clubId: string;
  userId: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    nickname: string;
    profilePicture: string | null;
  };
}

export interface IDiscoverMapCity {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  clubs: {
    id: string;
    name: string;
  }[];
}

export interface IDiscoverClubsResponse {
  data: IDiscoverClub[];
  mapCities: IDiscoverMapCity[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
}
