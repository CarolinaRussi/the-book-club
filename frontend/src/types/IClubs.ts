export interface IUserClub {
  id: string;
  name: string;
  status: string;
  owner_id: string;
  created_at: string;
  description?: string;
}

export interface IClubData {
  name: string;
  invitationCode: string;
  ownerId?: string;
  description: string;
}
