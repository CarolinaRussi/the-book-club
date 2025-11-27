import { api } from "../index";
import type { IBook, IUserBook } from "../../types/IBooks";
import type { IPaginatedResponse } from "@//types/IApi";

export const fetchBooksFromOpenLibrary = async (query: string) => {
  if (!query) return { docs: [] };
  const searchTerm = encodeURIComponent(query);
  const url = `https://openlibrary.org/search.json?q=${searchTerm}&fields=key,title,author_name,cover_i&limit=20`;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Erro na OpenLibrary");
  return response.json();
};

export const fetchBooksFromMyDatabase = async (query: string) => {
  const { data } = await api.get<IBook[]>("/books", {
    params: {
      q: query,
    },
  });

  return data || [];
};

export const fetchClubBooks = async (
  clubId: string | null
): Promise<IBook[]> => {
  const { data } = await api.get(`/club-books/${clubId}`);
  return data;
};

export const fetchPaginatedClubBooks = async (
  clubId: string | null,
  page: number = 1,
  itemsPerPage: number = 8
): Promise<IPaginatedResponse<IBook>> => {
  const { data } = await api.get(`/club-books/${clubId}`, {
    params: {
      page,
      limit: itemsPerPage,
    },
  });
  return data;
};

export const fetchPaginatedUserBooks = async (
  userId: string | null,
  page: number = 1,
  itemsPerPage: number = 15
): Promise<IPaginatedResponse<IUserBook>> => {
  const { data } = await api.get(`/user-books/${userId}`, {
    params: {
      page,
      limit: itemsPerPage,
    },
  });
  return data;
};
