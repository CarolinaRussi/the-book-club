export interface IUser {
  id: string;
  bio?: string;
  name?: string;
  lastName?: string;
  email?: string;
  nickname?: string;
  profile_picture?: string;
  favorites_genres?: string[];
}

export interface IUserUpdateForm
  extends Omit<IUser, "favorites_genres" | "profile_picture"> {
  password?: string;
  oldPassword?: string;
  confirmPassword?: string;
  tags?: string[];
  profile_picture?: FileList;
  profile_picture_url?: string;
  remove_profile_picture?: boolean;
}
