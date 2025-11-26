import { createContext, useContext, useMemo } from "react";
import {
  useQuery,
  type RefetchOptions,
  type QueryObserverResult,
} from "@tanstack/react-query";
import { useClub } from "./ClubContext";
import type { IBook } from "../types/IBooks";
import { fetchClubBooks } from "../api/queries/fetchBooks";
import { BOOK_STATUS_STARTED } from "../utils/constants/books";
import { useAuth } from "./AuthContext";

interface BookContextData {
  currentBooks: IBook[];
  booksFromSelectedClub: IBook[];
  isLoadingBooks: boolean;
  refetchBooks: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<IBook[], Error>>;
}

const BookContext = createContext<BookContextData | undefined>(undefined);

export function BookProvider({ children }: { children: React.ReactNode }) {
  const { selectedClubId } = useClub();
  const { user } = useAuth();

  const {
    data: books,
    isLoading: isLoadingBooks,
    refetch,
  } = useQuery<IBook[]>({
    queryKey: ["booksFromSelectedClub", selectedClubId],
    queryFn: () => fetchClubBooks(selectedClubId),
    staleTime: 1000 * 60 * 5,
    enabled: !!selectedClubId && !!user,
  });

  const booksFromSelectedClub = books || [];

  const currentBooks = useMemo(() => {
    return booksFromSelectedClub.filter(
      (book: IBook) => book.status === BOOK_STATUS_STARTED
    );
  }, [booksFromSelectedClub]);

  const value = {
    booksFromSelectedClub,
    currentBooks,
    isLoadingBooks,
    refetchBooks: refetch,
  };

  return <BookContext.Provider value={value}>{children}</BookContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBook() {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error("useBook deve ser usado dentro de BookProvider");
  }
  return context;
}
