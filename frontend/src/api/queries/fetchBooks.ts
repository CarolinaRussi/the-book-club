import { api } from "../index";
import { IBook } from "../../types/IBooks";

export const fetchBooksFromOpenLibrary = async (query: any) => {
  if (!query) return { docs: [] };
  const searchTerm = encodeURIComponent(query);
  const fields = "key,title,author_name,cover_i";
  const url = `https://openlibrary.org/search.json?q=${searchTerm}&fields=${fields}&limit=10`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Erro ao buscar os livros");
  }
  return response.json();
};

export const fetchClubBooks = async (clubId: string | null): Promise<IBook[]> => {
  const { data } = await api.get(`/club-books/${clubId}`);
  return data;
};
