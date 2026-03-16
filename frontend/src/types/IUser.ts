import type { UserStatus } from "../utils/constants/user";

export interface IUser {
  id: string;
  bio?: string;
  name?: string;
  lastName?: string;
  email?: string;
  nickname?: string;
  profilePicture?: string;
  favoritesGenres?: string[];
  status?: UserStatus;
}

export interface IUserUpdateForm
  extends Omit<IUser, "favoritesGenres" | "profilePicture"> {
  password?: string;
  oldPassword?: string;
  confirmPassword?: string;
  tags?: string[];
  profilePicture?: FileList;
  profilePictureUrl?: string;
  removeProfilePicture?: boolean;
}
