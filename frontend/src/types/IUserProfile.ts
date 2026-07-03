export interface IUserProfilePublic {
  id: string;
  name: string;
  nickname: string;
  profilePicture: string | null;
  bio: string | null;
  favoritesGenres: string[];
}

export interface IUserProfileResponse {
  user: IUserProfilePublic;
  stats: {
    finishedBooksCount: number;
  };
}
