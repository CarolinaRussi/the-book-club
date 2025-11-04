export interface IClub {
  id: string;
  name: string;
  status: string;
  owner_id: string;
  created_at: string;
  description?: string;
}

export interface IClubWithOwner extends IClub {
  user: {
    name: string;
  };
}

export interface IClubPayload {
  name: string;
  invitationCode: string;
  ownerId?: string;
  description: string;
}
