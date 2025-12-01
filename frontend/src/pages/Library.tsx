import { Card, CardContent } from "../components/ui/card";
import { formatMonthYear } from "../utils/formatters";
import { Rating } from "react-simple-star-rating";
import { LuCalendarDays } from "react-icons/lu";
import { FaPlus } from "react-icons/fa6";
import { useState } from "react";
import { Button } from "../components/ui/button";
import CreateBookDialog from "../components/pages/library/CreateBookDialog";
import { Badge } from "../components/ui/badge";
import type { IBook } from "../types/IBooks";
import AddReviewDialog from "../components/pages/library/AddReviewDialog";
import { bookStatusLabels } from "../utils/constants/books";
import {
  READING_STATUS_DROPPED,
  READING_STATUS_FINISHED,
} from "../utils/constants/reading";
import SkeletonLibrary from "../components/pages/library/skeletons/SkeletonLibrary";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useClub } from "../contexts/ClubContext";
import type { IApiError, IPaginatedResponse } from "../types/IApi";
import { fetchPaginatedClubBooks } from "../api/queries/fetchBooks";
import Pagination from "../components/ui/pagination";
// Mudei o PlusFill para Plus (versão outline/contorno)
import { BsBookmarkCheckFill, BsBookmarkPlusFill } from "react-icons/bs";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import { updateUserPersonalList } from "../api/mutations/userMutate";

export default function Library() {
  const [createBookOpen, setCreateBookOpen] = useState(false);
  const [updateBookOpen, setUpdateBookOpen] = useState(false);
  const [bookToUpdate, setBookToUpdate] = useState<IBook | undefined>(
    undefined
  );

  const queryClient = useQueryClient();
  const { selectedClubId } = useClub();
  const { user } = useAuth();
  const [booksPage, setBooksPage] = useState(1);
  const itemsPerPage = 8;

  const handlePageChange = (page: number) => {
    setBooksPage(page);
  };

  const { mutate: updateUserPersonalListMutate } = useMutation<
    any,
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
            data: old.data.map((book) => {
              if (book.id === bookId) {
                return { ...book, isInLibrary: !book.isInLibrary };
              }
              return book;
            }),
          };
        }
      );

      return { previousData };
    },

    onError: (_err, _newBook, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ["booksFromSelectedClub", selectedClubId, booksPage],
          context.previousData
        );
      }
      toast.error("Erro ao atualizar a biblioteca. Alteração desfeita.");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["booksFromSelectedClub"] });
    },

    onSuccess: (result) => {
      const message =
        result.action === "added"
          ? "Salvo na biblioteca"
          : "Removido da biblioteca";
      toast.success(message, { autoClose: 1000 });
    },
  });

  const handleAddToPersonalList = (bookId: string) => {
    if (user?.id) {
      const userId = user.id;
      updateUserPersonalListMutate({ bookId, userId });
    }
  };

  const { data: booksClubPaginatedData, isLoading: isLoadingBooks } = useQuery<
    IPaginatedResponse<IBook>
  >({
    queryKey: ["booksFromSelectedClub", selectedClubId, booksPage],
    queryFn: () =>
      fetchPaginatedClubBooks(selectedClubId, booksPage, itemsPerPage),
    staleTime: 1000 * 60 * 5,
    enabled: !!selectedClubId,
  });

  const booksClub = booksClubPaginatedData?.data || [];
  const totalPages = booksClubPaginatedData?.totalPages || 1;

  return (
    <div className="flex flex-col w-full max-w-7xl py-5 md:py-15 px-4 mx-auto">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
        <div className="flex flex-col items-start">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground ">
            Nossa Biblioteca
          </h1>
          <h2 className="text-md w-full text-warm-brown">
            Todos os livros que já lemos juntos, com notas e avaliações
          </h2>
        </div>
        <div>
          <Button
            className="font-semibold text-1xl py-6 w-full rounded-xl bg-primary text-primary-foreground cursor-pointer hover:bg-primary/80"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
            {booksClub &&
              booksClub.map((book) => {
                const reviews = book.reviews || [];

                const validReviews = reviews.filter(
                  (review) =>
                    review.reading_status === READING_STATUS_FINISHED ||
                    review.reading_status === READING_STATUS_DROPPED
                );

                const totalRating = validReviews.reduce(
                  (acc, review) => acc + review.rating,
                  0
                );

                const averageRating =
                  validReviews.length > 0
                    ? totalRating / validReviews.length
                    : 0;

                const isInLibrary = book.isInLibrary;

                return (
                  <Card
                    key={book.id}
                    className="relative isolate cursor-pointer hover:shadow-(--shadow-medium) transition-all group py-0 gap-0 max-w-sm mx-auto md:max-w-none md:mx-0 bg-card rounded-xl border"
                    onClick={() => {
                      setBookToUpdate(book);
                      setUpdateBookOpen(true);
                    }}
                  >
                    <div className="absolute -top-2 right-4 z-20">
                      <div className="absolute inset-x-2 top-2 bottom-4 bg-white rounded-xs" />

                      {isInLibrary ? (
                        <BsBookmarkCheckFill
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToPersonalList(book.id);
                          }}
                          size={40}
                          className="relative text-primary drop-shadow-md hover:scale-110 transition-transform"
                          title="Remover da biblioteca pessoal"
                        />
                      ) : (
                        <BsBookmarkPlusFill
                          onClick={(e) => {
                            e.stopPropagation();

                            handleAddToPersonalList(book.id);
                          }}
                          size={40}
                          className="relative text-primary drop-shadow-md hover:text-primary hover:scale-110 transition-all"
                          title="Adicionar à biblioteca pessoal"
                        />
                      )}
                    </div>

                    <div className="relative aspect-2/3 overflow-hidden bg-muted rounded-t-xl">
                      <img
                        src={book.cover_url}
                        alt={book.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-30 transition-opacity" />
                    </div>

                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold line-clamp-2 flex-1 min-h-14">
                          {book.title}
                        </h3>
                        <Badge className="ml-2 shrink-0">
                          {bookStatusLabels[book.status]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {book.author}
                      </p>

                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          <Rating
                            initialValue={averageRating}
                            readonly
                            allowFraction
                            SVGstyle={{ display: "inline" }}
                            size={25}
                            fillColor="#be2c3f"
                            emptyColor="#e2cad0"
                          />
                        </div>
                        <span className="text-sm font-semibold">
                          {averageRating.toFixed(1)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <LuCalendarDays size={20} />
                          {formatMonthYear(book.added_at)}
                        </div>
                        <span>
                          {validReviews.length}{" "}
                          {validReviews.length === 1
                            ? "avaliação"
                            : "avaliações"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
          {booksClub.length > 0 && totalPages > 1 && (
            <div className="mt-8 flex justify-center w-full">
              <Pagination
                currentPage={booksPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
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
          if (!isOpen) {
            setBookToUpdate(undefined);
          }
        }}
        book={bookToUpdate}
      />
    </div>
  );
}
