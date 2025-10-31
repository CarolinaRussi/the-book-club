export interface IUser {
  id: string;
  email: string;
  name: string;
  nickname: string;
}

export interface IUserUpdate {
  id: string;
  bio?: string;
  name?: string;
  lastName?: string;
  email?: string;
  nickname?: string;
  password?: string;
  profile_picture?: string;
  favorites_genres?: string;
}
