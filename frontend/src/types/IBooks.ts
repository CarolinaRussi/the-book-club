export interface IUserReview {
  id: string;
  name: string;
  nickname: string;
}

export interface IReview {
  id: string;
  reading_status: string;
  rating: number;
  review: string;
  user: IUserReview;
}

export interface IBook {
  id: string;
  title: string;
  author: string;
  cover_url: string;
  status: string;
  created_at: string;
  review?: IReview[];
}

export interface IOpenLibraryBook {
  key?: string;
  title: string;
  author_name: string[];
  cover_i?: number;
}

export interface IBookPayload {
  openLibraryId?: string;
  title: string;
  author: string;
  coverUrl?: string;
  coverImg?: FileList;
  clubId: string;
}
