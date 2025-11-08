import { BookStatus } from "../enums/bookStatus";

export interface BookCreateInput {
  title: string;
  author: string;
  club_id: string;
  open_library_id: string;
  cover_url: string;
  status: BookStatus;
  cover_public_id?: string;
}
