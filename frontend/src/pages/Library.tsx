import { Card, CardContent } from "../components/ui/card";
import { formatMonthYear } from "../utils/formatters";
import { Rating } from "react-simple-star-rating";
import { LuCalendarDays } from "react-icons/lu";
import { FaPlus } from "react-icons/fa6";
import { useState } from "react";
import { Button } from "../components/ui/button";
import CreateBookDialog from "../components/pages/library/CreateBookDialog";
import { useBook } from "../contexts/BookContext";
import { Badge } from "../components/ui/badge";
import type { IBook } from "../types/IBooks";
import AddReviewDialog from "../components/pages/library/AddReviewDialog";
import { bookStatusLabels } from "../utils/constants/books";
import {
  READING_STATUS_DROPPED,
  READING_STATUS_FINISHED,
} from "../utils/constants/reading";
import SkeletonLibrary from "../components/pages/library/skeletons/SkeletonLibrary";

export default function Library() {
  const [createBookOpen, setCreateBookOpen] = useState(false);
  const [updateBookOpen, setUpdateBookOpen] = useState(false);
  const [bookToUpdate, setBookToUpdate] = useState<IBook | undefined>(
    undefined
  );
  const { booksFromSelectedClub, isLoadingBooks } = useBook();

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
          {booksFromSelectedClub.map((book) => {
            const reviews = book.review || [];

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
              validReviews.length > 0 ? totalRating / validReviews.length : 0;

            return (
              <Card
                key={book.title}
                className="cursor-pointer hover:shadow-(--shadow-medium) transition-all overflow-hidden group py-0 gap-0 max-w-sm mx-auto md:max-w-none md:mx-0"
                onClick={() => {
                  setBookToUpdate(book);
                  setUpdateBookOpen(true);
                }}
              >
                <div className="relative aspect-2/3 overflow-hidden bg-muted">
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
                      {validReviews.length === 1 ? "avaliação" : "avaliações"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
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
