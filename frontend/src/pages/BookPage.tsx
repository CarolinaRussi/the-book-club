import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  keepPreviousData,
  useQuery,
} from "@tanstack/react-query";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import { fetchBookPage } from "@/api/queries/fetchBookPage";
import { BookPageClubLinks } from "@/components/pages/book/BookPageClubLinks";
import { BookPageReviewForm } from "@/components/pages/book/BookPageReviewForm";
import { BookPageReviewsSection } from "@/components/pages/book/BookPageReviewsSection";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import type { BookReviewsScope } from "@/types/IBooks";

const REVIEWS_LIMIT = 20;

export default function BookPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [reviewsScope, setReviewsScope] = useState<BookReviewsScope>("all");
  const [reviewsPage, setReviewsPage] = useState(1);

  const {
    data: bookPage,
    isLoading,
    isFetching,
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
    placeholderData: keepPreviousData,
  });

  const isInitialLoading = isLoading;
  const isReviewsLoading = isFetching && !isInitialLoading;

  if (!user || !bookId) {
    return null;
  }

  const errorMessage = axios.isAxiosError(error)
    ? (error.response?.data as { message?: string })?.message
    : undefined;
  const isNotFound = axios.isAxiosError(error) && error.response?.status === 404;

  const handleScopeChange = (scope: BookReviewsScope) => {
    setReviewsScope(scope);
    setReviewsPage(1);
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

      {isInitialLoading ? (
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
            </div>

            <div className="min-w-0 flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-semibold text-primary sm:text-3xl">
                {bookPage.book.title}
              </h1>
              <p className="mt-2 text-warm-brown/70">{bookPage.book.author}</p>
              <BookPageClubLinks clubs={bookPage.myClubsWithBook} />
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
            isLoading={isReviewsLoading}
            onScopeChange={handleScopeChange}
            onPageChange={setReviewsPage}
          />
        </>
      ) : null}
    </div>
  );
}
