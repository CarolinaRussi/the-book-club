import type { ClubStatus } from "../utils/constants/clubs";
import type { IUser } from "./IUser";

export interface IClub {
  id: string;
  name: string;
  status: ClubStatus;
  ownerId: string;
  invitationCode: string;
  createdAt: string;
  description?: string;
}

export interface IClubWithOwner extends IClub {
  user: {
    name: string;
  };
}

export interface IClubPayload {
  name: string;
  ownerId?: string;
  description: string;
}

export interface IEditClubPayload {
  id: string;
  name: string;
  description: string;
  invitationCode: string;
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
  member: IMembersClub[];
}
