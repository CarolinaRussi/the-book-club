export interface IReview {
  id: string;
  userId: string;
  rating: number;
  review: string;
}

export interface IBook {
  id: string;
  name: string;
  author: string;
  image_url: string;
  createdAt: string;
  reviews: IReview[];
}

export interface IOpenLibraryBook {
  key?: string;
  title: string;
  author_name: string[];
  cover_i?: number;
}

export interface IBookPayload {
  OpenLibraryId?: string;
  title: string;
  author: string;
  coverUrl?: string;
  coverImg?: File;
}
