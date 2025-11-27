import type { BookStatus } from "../utils/constants/books";
import type { ReadingStatus } from "../utils/constants/reading";
import type { IUser } from "./IUser";

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
  comment: string;
  user: IUser;
}

export interface IUserBook {
  id: string;
  reading_status: ReadingStatus;
  updated_at: string;
  book: IBook;
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
  reviews?: IReview[];
}

export interface IOpenLibraryBook {
  key?: string;
  title: string;
  author_name: string[];
  cover_i?: number;
}

export interface IBookPayload {
  id?: string;
  title: string;
  author: string;
  coverUrlOpenLibrary?: string;
  coverImg?: FileList;
  clubId: string;
}

export interface IBookReviewPayload {
  rating: number;
  comment: string;
  reading_status: ReadingStatus | undefined;
  clubId: string;
  userId: string;
  bookId: string;
}
