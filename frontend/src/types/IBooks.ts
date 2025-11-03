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
  description: string;
  image_url: string;
  createdAt: string;
  reviews: IReview[];
}
