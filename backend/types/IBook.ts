import { BookStatus } from "../enums/bookStatus";

export interface BookCreateInput {
  title: string;
  author: string;
  open_library_id: string;
  cover_url: string;
  cover_public_id?: string;
}
