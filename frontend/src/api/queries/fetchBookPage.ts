import { api } from "../index";
import type { BookReviewsScope, IBookPageResponse } from "@/types/IBooks";

export async function fetchBookPage(
  bookId: string,
  options: {
    scope?: BookReviewsScope;
    page?: number;
    limit?: number;
  } = {},
): Promise<IBookPageResponse> {
  const { data } = await api.get<IBookPageResponse>(`/books/${bookId}`, {
    params: {
      scope: options.scope ?? "all",
      page: options.page ?? 1,
      limit: options.limit ?? 20,
    },
  });
  return data;
}
