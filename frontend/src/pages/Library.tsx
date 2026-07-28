import { useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { deleteClubBook } from "@/api/mutations/bookMutate";
import { updateUserPersonalList } from "@/api/mutations/userMutate";
import { fetchPaginatedClubBooks } from "@/api/queries/fetchBooks";
import AddReviewDialog from "@/components/pages/library/AddReviewDialog";
import CreateBookDialog from "@/components/pages/library/CreateBookDialog";
import { LibraryBookCard } from "@/components/pages/library/LibraryBookCard";
import SkeletonLibrary from "@/components/pages/library/skeletons/SkeletonLibrary";
import { Button } from "@/components/ui/button";
import Pagination from "@/components/ui/pagination";
import { useAuth } from "@/contexts/AuthContext";
import { useClub } from "@/contexts/ClubContext";
import type { IApiError, IPaginatedResponse } from "@/types/IApi";
import type { IBook } from "@/types/IBooks";
import { BOOK_STATUS_SUGGESTED } from "@/utils/constants/books";

export default function Library() {
  const [createBookOpen, setCreateBookOpen] = useState(false);
  const [updateBookOpen, setUpdateBookOpen] = useState(false);
  const [bookToUpdate, setBookToUpdate] = useState<IBook | undefined>();
  const [booksPage, setBooksPage] = useState(1);
  const itemsPerPage = 8;

  const queryClient = useQueryClient();
  const { clubs, selectedClubId } = useClub();
  const { user } = useAuth();
  const selectedClub = clubs.find((club) => club.id === selectedClubId);

  const { mutate: updateUserPersonalListMutate } = useMutation<
    { action: string },
    IApiError,
    { bookId: string; userId: string },
    { previousData: IPaginatedResponse<IBook> | undefined }
  >({
    mutationFn: updateUserPersonalList,
    onMutate: async ({ bookId }) => {
      await queryClient.cancelQueries({
        queryKey: ["booksFromSelectedClub", selectedClubId, booksPage],
      });
      const previousData = queryClient.getQueryData<IPaginatedResponse<IBook>>([
        "booksFromSelectedClub",
        selectedClubId,
        booksPage,
      ]);
      queryClient.setQueryData<IPaginatedResponse<IBook>>(
        ["booksFromSelectedClub", selectedClubId, booksPage],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((book) =>
              book.id === bookId
                ? { ...book, isInLibrary: !book.isInLibrary }
                : book,
            ),
          };
        },
      );
      return { previousData };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ["booksFromSelectedClub", selectedClubId, booksPage],
          context.previousData,
        );
      }
      toast.error("Erro ao atualizar a biblioteca. Alteração desfeita.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["booksFromSelectedClub"] });
    },
    onSuccess: (result) => {
      toast.success(
        result.action === "added"
          ? "Adicionado à fila Quero ler"
          : "Removido da fila Quero ler",
        { autoClose: 1000 },
      );
    },
  });

  const { mutate: deleteClubBookMutate, isPending: isDeletingBook } =
    useMutation<unknown, IApiError, { clubId: string; bookId: string }>({
      mutationFn: deleteClubBook,
      onSuccess: () => {
        toast.success("Livro excluído com sucesso!");
        setUpdateBookOpen(false);
        setBookToUpdate(undefined);
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
        <div>
          <Button
            className="w-full cursor-pointer rounded-xl bg-primary py-6 text-1xl font-semibold text-primary-foreground hover:bg-primary/80"
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
                userId={user?.id}
                canDelete={canDeleteBook(book)}
                isDeleting={isDeletingBook}
                onOpenDetails={() => {
                  setBookToUpdate(book);
                  setUpdateBookOpen(true);
                }}
                onTogglePersonalList={() => {
                  if (user?.id) {
                    updateUserPersonalListMutate({
                      bookId: book.id,
                      userId: user.id,
                    });
                  }
                }}
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
      <AddReviewDialog
        open={updateBookOpen}
        onOpenChange={(isOpen) => {
          setUpdateBookOpen(isOpen);
          if (!isOpen) setBookToUpdate(undefined);
        }}
        book={bookToUpdate}
        canDeleteBook={bookToUpdate ? canDeleteBook(bookToUpdate) : false}
        isDeletingBook={isDeletingBook}
        onDeleteBook={() => {
          if (bookToUpdate) handleDeleteBook(bookToUpdate);
        }}
      />
    </div>
  );
}
