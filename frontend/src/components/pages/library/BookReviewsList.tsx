import { Rating } from "react-simple-star-rating";
import { getInitials } from "@/utils/formatters";
import {
  READING_STATUS_DROPPED,
  READING_STATUS_FINISHED,
} from "@/utils/constants/reading";
import type { IReview } from "@/types/IBooks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardTitle } from "@/components/ui/card";

type BookReviewsListProps = {
  reviews: IReview[];
};

export function BookReviewsList({ reviews }: BookReviewsListProps) {
  return (
    <div>
      <h1 className="mb-3 text-xl font-semibold text-primary">
        Todas as avaliações
      </h1>
      {reviews.map((review) => {
        const isAbandoned = review.readingStatus === READING_STATUS_DROPPED;
        return (
          <Card
            key={review.id}
            className="my-4 flex h-full flex-col gap-4 bg-cream p-4 sm:flex-row sm:items-start"
          >
            <Avatar className="size-15 self-center">
              <AvatarImage
                src={review.user.profilePicture || undefined}
                alt="Foto de perfil"
              />
              <AvatarFallback
                className="text-1xl font-semibold text-primary"
                delayMs={600}
              >
                {getInitials(review.user.name || "")}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <CardTitle>{review.user.nickname}</CardTitle>
              {isAbandoned ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  Abandonou a leitura deste livro.
                </p>
              ) : (
                <h3 className="mt-1 text-sm text-muted-foreground">
                  {review.comment}
                </h3>
              )}
            </div>

            {!isAbandoned ? (
              <div className="shrink-0">
                <Rating
                  initialValue={review.rating}
                  readonly
                  allowFraction
                  SVGstyle={{ display: "inline" }}
                  size={25}
                  fillColor="#be2c3f"
                  emptyColor="#e2cad0"
                />
              </div>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}

export function finishedReviewsAverage(reviews: IReview[]) {
  const finished = reviews.filter(
    (review) => review.readingStatus === READING_STATUS_FINISHED,
  );
  if (finished.length === 0) return { average: 0, count: 0 };
  const total = finished.reduce((sum, review) => sum + review.rating, 0);
  return { average: total / finished.length, count: finished.length };
}
