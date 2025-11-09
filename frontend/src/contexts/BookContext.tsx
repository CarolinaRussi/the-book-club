import { createContext, useContext, useMemo } from "react"; // Adicione useMemo
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
  const { selectedClubId } = useClub();

  const { data: books, isLoading: isLoadingBooks } = useQuery<IBook[]>({
    queryKey: ["booksFromSelectedClub", selectedClubId],
    queryFn: () => fetchClubBooks(selectedClubId),
    staleTime: 1000 * 60 * 5,
    enabled: !!selectedClubId,
  });

  const booksFromSelectedClub = books || [];

  const actualBook = useMemo(() => {
    return booksFromSelectedClub.filter(
      (book: IBook) => book.status === "started"
    );
  }, [booksFromSelectedClub]);

  const value = {
    booksFromSelectedClub,
    actualBook,
    isLoadingBooks,
  };

  return <BookContext.Provider value={value}>{children}</BookContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBook() {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error("useBook deve ser usado dentro de BookProvider"); // Corrigido de useClub para useBook
  }
  return context;
}
