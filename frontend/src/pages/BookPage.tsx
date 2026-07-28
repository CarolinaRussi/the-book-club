import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { BsBookmarkCheckFill, BsBookmarkPlusFill } from "react-icons/bs";
import { toast } from "react-toastify";
import { fetchBookPage } from "@/api/queries/fetchBookPage";
import { updateUserPersonalList } from "@/api/mutations/userMutate";
import { BookPageMyClubsSection } from "@/components/pages/book/BookPageMyClubsSection";
import { BookPageReviewForm } from "@/components/pages/book/BookPageReviewForm";
import { BookPageReviewsSection } from "@/components/pages/book/BookPageReviewsSection";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import type { IApiError } from "@/types/IApi";
import type { BookReviewsScope, IBookPageResponse } from "@/types/IBooks";
import { READING_STATUS_WANT_TO_READ } from "@/utils/constants/reading";

const REVIEWS_LIMIT = 20;

export default function BookPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [reviewsScope, setReviewsScope] = useState<BookReviewsScope>("all");
  const [reviewsPage, setReviewsPage] = useState(1);

  const {
    data: bookPage,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["book", bookId, reviewsScope, reviewsPage],
    queryFn: () =>
      fetchBookPage(bookId!, {
        scope: reviewsScope,
        page: reviewsPage,
        limit: REVIEWS_LIMIT,
      }),
    enabled: !!user && !!bookId,
    staleTime: 1000 * 60 * 5,
  });

  const { mutate: updateUserPersonalListMutate } = useMutation<
    { action: string },
    IApiError,
    { bookId: string; userId: string },
    { previousData: IBookPageResponse | undefined }
  >({
    mutationFn: updateUserPersonalList,
    onMutate: async ({ bookId: targetBookId }) => {
      await queryClient.cancelQueries({ queryKey: ["book", targetBookId] });
      const previousData = queryClient.getQueryData<IBookPageResponse>([
        "book",
        targetBookId,
        reviewsScope,
        reviewsPage,
      ]);
      queryClient.setQueryData<IBookPageResponse>(
        ["book", targetBookId, reviewsScope, reviewsPage],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            isInWantToReadQueue: !old.isInWantToReadQueue,
          };
        },
      );
      return { previousData };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData && bookId) {
        queryClient.setQueryData(
          ["book", bookId, reviewsScope, reviewsPage],
          context.previousData,
        );
      }
      toast.error("Erro ao atualizar a fila Quero ler. Alteração desfeita.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["book", bookId] });
      queryClient.invalidateQueries({ queryKey: ["booksFromSelectedClub"] });
      queryClient.invalidateQueries({ queryKey: ["userReadings"] });
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

  if (!user || !bookId) {
    return null;
  }

  const errorMessage = axios.isAxiosError(error)
    ? (error.response?.data as { message?: string })?.message
    : undefined;
  const isNotFound = axios.isAxiosError(error) && error.response?.status === 404;

  const showBookmark =
    !bookPage?.myUserBook ||
    bookPage.myUserBook.readingStatus === READING_STATUS_WANT_TO_READ;

  const handleScopeChange = (scope: BookReviewsScope) => {
    setReviewsScope(scope);
    setReviewsPage(1);
  };

  const handleToggleBookmark = () => {
    updateUserPersonalListMutate({ bookId, userId: user.id });
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-5 md:px-8 md:py-12">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex w-fit cursor-pointer items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>

      {isLoading ? (
        <div className="space-y-8">
          <div className="flex flex-col gap-6 sm:flex-row">
            <Skeleton className="mx-auto aspect-2/3 w-36 shrink-0 rounded-2xl sm:mx-0" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-9 w-full max-w-md" />
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : isError ? (
        <p className="py-12 text-center text-muted-foreground">
          {errorMessage ??
            (isNotFound
              ? "Livro não encontrado."
              : "Não foi possível carregar este livro.")}
        </p>
      ) : bookPage ? (
        <>
          <header className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="relative mx-auto w-36 shrink-0 sm:mx-0">
              <img
                src={bookPage.book.coverUrl}
                alt={bookPage.book.title}
                className="aspect-2/3 w-full rounded-2xl object-cover"
              />
              {showBookmark ? (
                <div className="absolute -top-2 -right-2">
                  {bookPage.isInWantToReadQueue ? (
                    <button
                      type="button"
                      onClick={handleToggleBookmark}
                      title="Remover da fila Quero ler"
                      className="cursor-pointer transition-transform hover:scale-110"
                    >
                      <BsBookmarkCheckFill
                        size={40}
                        className="text-primary drop-shadow-md"
                      />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleToggleBookmark}
                      title="Salvar na fila Quero ler"
                      className="cursor-pointer transition-transform hover:scale-110"
                    >
                      <BsBookmarkPlusFill
                        size={40}
                        className="text-primary drop-shadow-md"
                      />
                    </button>
                  )}
                </div>
              ) : null}
            </div>

            <div className="min-w-0 flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-semibold text-primary sm:text-3xl">
                {bookPage.book.title}
              </h1>
              <p className="mt-2 text-warm-brown/70">{bookPage.book.author}</p>
            </div>
          </header>

          <hr />

          <BookPageReviewForm
            bookId={bookId}
            myUserBook={bookPage.myUserBook}
            myReview={bookPage.myReview}
          />

          <hr />

          <BookPageReviewsSection
            reviews={bookPage.reviews.data}
            totalPages={bookPage.reviews.totalPages}
            currentPage={bookPage.reviews.currentPage}
            totalItems={bookPage.reviews.totalItems}
            reviewsLimit={REVIEWS_LIMIT}
            scope={reviewsScope}
            onScopeChange={handleScopeChange}
            onPageChange={setReviewsPage}
          />

          <hr />

          <BookPageMyClubsSection clubs={bookPage.myClubsWithBook} />
        </>
      ) : null}
    </div>
  );
}
