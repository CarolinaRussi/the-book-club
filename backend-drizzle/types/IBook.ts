export interface BookCreateInput {
  title: string;
  author: string;
  openLibraryId: string;
  coverUrl: string;
  coverPublicId?: string;
}
