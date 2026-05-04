import type { BookStatus } from "../utils/constants/books";
import type { ReadingStatus } from "../utils/constants/reading";
import type { IUser } from "./IUser";

export interface IUserPreview {
  id: string;
  name: string;
  nickname: string;
  profilePicture: string;
}

export interface IMemberReview {
  user: IUserPreview;
}

export interface IReview {
  id: string;
  readingStatus: ReadingStatus;
  rating: number;
  comment: string;
  user: IUser;
}

export interface IUserBookClub {
  id: string;
  name: string;
}

export interface IUserBook {
  id: string;
  readingStatus: ReadingStatus;
  updatedAt: string;
  myRating: number | null;
  myComment: string | null;
  clubs: IUserBookClub[];
  book: Pick<IBook, "id" | "title" | "author" | "coverUrl"> | null;
}

export interface IBook {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  openLibraryId?: string | null;
  status: BookStatus;
  addedAt: string;
  createdAt: string;
  reviews?: IReview[];
  isInLibrary?: boolean;
  suggestedBy?: { id: string; name: string; nickname: string } | null;
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
  readingStatus: ReadingStatus | undefined;
  clubId: string;
  userId: string;
  bookId: string;
}
