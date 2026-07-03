export interface IReaders {
  joinedAt: string;
  user: {
    id: string;
    bio: string;
    favoritesGenres: string[];
    name: string;
    nickname: string;
    profilePicture: string;
  };
}
