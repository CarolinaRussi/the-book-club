import { createContext, useState, useContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useClub } from "./ClubContext";
import { IBook } from "../types/IBooks";
import { fetchClubBooks } from "../api/queries/fetchBooks";

interface BookContextData {
  actualBook: IBook[];
  booksFromSelectedClub: IBook[];
  isLoadingBooks: boolean;
}

const BookContext = createContext<BookContextData | undefined>(undefined);

export function BookProvider({ children }: { children: React.ReactNode }) {
  const [actualBook, setActualBook] = useState<IBook[]>([]);
  const [booksFromSelectedClub, setBooksFromSelectedClub] = useState<IBook[]>(
    []
  );
  const { selectedClubId } = useClub();

  const { data: books, isLoading: isLoadingBooks } = useQuery<IBook[]>({
    queryKey: ["booksFromSelectedClub", selectedClubId],
    queryFn: () => fetchClubBooks(selectedClubId),
    staleTime: 1000 * 60 * 5,
    enabled: !!selectedClubId,
  });

  useEffect(() => {
    if (books && books.length > 0) {
      setBooksFromSelectedClub(books);

      const startedBooks = books.filter(
        (book: IBook) => book.status === "started"
      );
      setActualBook(startedBooks);
    }
  }, [books, booksFromSelectedClub]);

  const value = {
    booksFromSelectedClub,
    actualBook,
    isLoadingBooks,
  };

  useEffect(() => {
    if (!selectedClubId) {
      setBooksFromSelectedClub([]);
      setActualBook([]);
    }
  }, [selectedClubId]);

  return <BookContext.Provider value={value}>{children}</BookContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBook() {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error("useClub deve ser usado dentro de ClubProvider");
  }
  return context;
}
