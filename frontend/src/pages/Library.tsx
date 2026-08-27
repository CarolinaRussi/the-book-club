import { useState } from "react";
import { useNavigate } from "react-router";
import { FaPlus } from "react-icons/fa6";
import { Dices } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { deleteClubBook } from "@/api/mutations/bookMutate";
import { fetchPaginatedClubBooks } from "@/api/queries/fetchBooks";
import CreateBookDialog from "@/components/pages/library/CreateBookDialog";
import CreateReadingDrawDialog from "@/components/pages/reading-draw/CreateReadingDrawDialog";
import { LibraryBookCard } from "@/components/pages/library/LibraryBookCard";
import SkeletonLibrary from "@/components/pages/library/skeletons/SkeletonLibrary";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/ui/pagination";
import { useAuth } from "@/contexts/AuthContext";
import { useClub } from "@/contexts/ClubContext";
import type { IApiError } from "@/types/IApi";
import type { IBook } from "@/types/IBooks";
import { BOOK_STATUS_SUGGESTED } from "@/utils/constants/books";

export default function Library() {
  const [createBookOpen, setCreateBookOpen] = useState(false);
  const [createDrawOpen, setCreateDrawOpen] = useState(false);
  const [booksPage, setBooksPage] = useState(1);
  const itemsPerPage = 8;

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { clubs, selectedClubId } = useClub();
  const { user } = useAuth();
  const selectedClub = clubs.find((club) => club.id === selectedClubId);

  const { mutate: deleteClubBookMutate, isPending: isDeletingBook } =
    useMutation<unknown, IApiError, { clubId: string; bookId: string }>({
      mutationFn: deleteClubBook,
      onSuccess: () => {
        toast.success("Livro excluído com sucesso!");
        queryClient.invalidateQueries({ queryKey: ["booksFromSelectedClub"] });
      },
      onError: (error) => {
        toast.error(error.message || "Erro ao excluir o livro.");
      },
    });

  const canDeleteBook = (book: IBook) => {
    if (!user) return false;
    const isClubOwner = selectedClub?.ownerId === user.id;
    const isBookSuggester = book.suggestedBy?.id === user.id;
    return book.status === BOOK_STATUS_SUGGESTED
      ? isClubOwner || isBookSuggester
      : isClubOwner;
  };

  const handleDeleteBook = (book: IBook) => {
    if (!selectedClubId) {
      toast.error("Clube não encontrado, não é possível excluir.");
      return;
    }
    deleteClubBookMutate({ clubId: selectedClubId, bookId: book.id });
  };

  const { data: booksClubPaginatedData, isLoading: isLoadingBooks } = useQuery({
    queryKey: ["booksFromSelectedClub", selectedClubId, booksPage],
    queryFn: () =>
      fetchPaginatedClubBooks(selectedClubId, booksPage, itemsPerPage),
    staleTime: 1000 * 60 * 5,
    enabled: !!selectedClubId,
  });

  const booksClub = booksClubPaginatedData?.data || [];
  const totalPages = booksClubPaginatedData?.totalPages || 1;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col px-4 py-5 md:py-15">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="flex flex-col items-start">
          <h1 className="text-3xl font-bold text-foreground md:text-4xl">
            Nossa Biblioteca
          </h1>
          <h2 className="text-md w-full text-warm-brown">
            Todos os livros que já lemos juntos, com notas e avaliações
          </h2>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="w-full cursor-pointer rounded-xl border-primary py-6 text-1xl font-semibold text-primary hover:bg-primary/10 sm:w-auto"
            onClick={() => setCreateDrawOpen(true)}
          >
            <Dices className="size-5" />
            Sortear próxima leitura
          </Button>
          <Button
            className="w-full cursor-pointer rounded-xl bg-primary py-6 text-1xl font-semibold text-primary-foreground hover:bg-primary/80 sm:w-auto"
            onClick={() => setCreateBookOpen(true)}
          >
            <FaPlus size={24} />
            Adicionar nova leitura
          </Button>
        </div>
      </div>

      {isLoadingBooks ? (
        <SkeletonLibrary />
      ) : (
        <>
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
            {booksClub.map((book) => (
              <LibraryBookCard
                key={book.id}
                book={book}
                canDelete={canDeleteBook(book)}
                isDeleting={isDeletingBook}
                onOpenDetails={() => navigate(`/books/${book.id}`)}
                onDelete={() => handleDeleteBook(book)}
              />
            ))}
          </div>
          {booksClub.length > 0 && totalPages > 1 ? (
            <div className="mt-8 flex w-full justify-center">
              <Pagination
                currentPage={booksPage}
                totalPages={totalPages}
                onPageChange={setBooksPage}
              />
            </div>
          ) : null}
        </>
      )}

      <CreateBookDialog
        open={createBookOpen}
        onOpenChange={setCreateBookOpen}
      />
      <CreateReadingDrawDialog
        open={createDrawOpen}
        onOpenChange={setCreateDrawOpen}
      />
    </div>
  );
}
