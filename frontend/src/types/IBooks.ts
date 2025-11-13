export type BookStatus = "suggested" | "started" | "dropped" | "finished";

export type ReadingStatus = "not_started" | "dropped" | "started" | "finished";

export interface IUserPreview {
  id: string;
  name: string;
  nickname: string;
  profile_picture: string;
}

export interface IMemberReview {
  user: IUserPreview;
}

export interface IReview {
  id: string;
  reading_status: ReadingStatus;
  rating: number;
  review: string;
  member: IMemberReview;
}

export interface IBook {
  id: string;
  title: string;
  author: string;
  cover_url: string;
  open_library_id?: string | null;
  status: BookStatus;
  added_at: string;
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

export interface IBookReviewPayload {
  rating: number;
  review: string;
  reading_status: ReadingStatus | undefined;
  userId: string;
  bookId: string;
}
