import {
  BookReviewsList,
  finishedReviewsAverage,
} from "@/components/pages/library/BookReviewsList";
import Pagination from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { BookReviewsScope, IReview } from "@/types/IBooks";
import { Rating } from "react-simple-star-rating";

type BookPageReviewsSectionProps = {
  reviews: IReview[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
  reviewsLimit: number;
  scope: BookReviewsScope;
  isLoading?: boolean;
  onScopeChange: (scope: BookReviewsScope) => void;
  onPageChange: (page: number) => void;
};

function ReviewsListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} className="h-24 w-full rounded-xl" />
      ))}
    </div>
  );
}

export function BookPageReviewsSection({
  reviews,
  totalPages,
  currentPage,
  totalItems,
  reviewsLimit,
  scope,
  isLoading = false,
  onScopeChange,
  onPageChange,
}: BookPageReviewsSectionProps) {
  const { average: averageRating, count: finishedCount } =
    finishedReviewsAverage(reviews);
  const showAverage =
    !isLoading && totalItems <= reviewsLimit && finishedCount > 0;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-primary">Avaliações</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={scope === "all" ? "default" : "outline"}
            onClick={() => onScopeChange("all")}
          >
            Todas
          </Button>
          <Button
            type="button"
            size="sm"
            variant={scope === "my_clubs" ? "default" : "outline"}
            onClick={() => onScopeChange("my_clubs")}
          >
            Dos meus clubes
          </Button>
        </div>
      </div>

      {showAverage ? (
        <div className="flex flex-wrap items-center gap-2">
          <Rating
            initialValue={averageRating}
            readonly
            allowFraction
            SVGstyle={{ display: "inline" }}
            size={25}
            fillColor="#be2c3f"
            emptyColor="#e2cad0"
          />
          <span className="text-lg font-bold text-warm-brown/70">
            {averageRating.toFixed(1)}
          </span>
        </div>
      ) : null}

      {isLoading ? (
        <Skeleton className="h-4 w-28" />
      ) : (
        <p className="text-sm text-muted-foreground">
          {totalItems} {totalItems === 1 ? "avaliação" : "avaliações"}
        </p>
      )}

      {isLoading ? (
        <ReviewsListSkeleton />
      ) : reviews.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          {scope === "my_clubs"
            ? "Nenhuma avaliação dos seus clubes ainda."
            : "Nenhuma avaliação ainda."}
        </p>
      ) : (
        <BookReviewsList reviews={reviews} />
      )}

      {!isLoading && totalPages > 1 ? (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          className="justify-center"
        />
      ) : null}
    </section>
  );
}
