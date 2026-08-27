import { LuCalendarDays } from "react-icons/lu";
import { Trash2 } from "lucide-react";
import { Rating } from "react-simple-star-rating";
import type { IBook } from "@/types/IBooks";
import { formatMonthYear } from "@/utils/formatters";
import { getBookStatusBadgeLabel } from "@/utils/constants/books";
import { finishedReviewsAverage } from "@/components/pages/library/BookReviewsList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type LibraryBookCardProps = {
  book: IBook;
  canDelete: boolean;
  isDeleting: boolean;
  onOpenDetails: () => void;
  onDelete: () => void;
};

export function LibraryBookCard({
  book,
  canDelete,
  isDeleting,
  onOpenDetails,
  onDelete,
}: LibraryBookCardProps) {
  const { average: averageRating, count: reviewsCount } =
    finishedReviewsAverage(book.reviews || []);

  const deleteDialog = canDelete ? (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="destructive"
          className="pointer-events-auto w-full max-w-45"
          disabled={isDeleting}
        >
          {isDeleting ? "Excluindo..." : "Excluir"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir livro?</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir{" "}
            <span className="font-semibold">{book.title}</span> da biblioteca do
            clube?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive"
          >
            Excluir livro
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ) : null;

  const handleCardClick = () => {
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) {
      onOpenDetails();
    }
  };

  return (
    <Card
      className="group relative isolate flex w-full cursor-pointer flex-row items-stretch gap-0 overflow-hidden rounded-xl border bg-card py-0 transition-all hover:shadow-(--shadow-medium) md:flex-col md:overflow-visible"
      onClick={handleCardClick}
    >
      {canDelete ? (
        <div className="absolute top-1 left-2 z-40 md:hidden">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                className="text-destructive transition-colors hover:text-destructive/80"
                disabled={isDeleting}
                title="Excluir livro"
                onClick={(event) => event.stopPropagation()}
              >
                <Trash2 className="size-5" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir livro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir{" "}
                  <span className="font-semibold">{book.title}</span> da
                  biblioteca do clube?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  disabled={isDeleting}
                  className="bg-destructive hover:bg-destructive/90 focus-visible:ring-destructive"
                >
                  Excluir livro
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ) : null}

      <div className="pointer-events-none invisible absolute inset-0 z-30 hidden flex-col items-center justify-center gap-3 rounded-xl bg-black/65 px-4 opacity-0 transition-opacity md:flex md:group-hover:visible md:group-hover:opacity-100 md:group-focus-within:visible md:group-focus-within:opacity-100">
        <Button
          type="button"
          className="pointer-events-auto w-full max-w-45"
          onClick={onOpenDetails}
        >
          Ver detalhes
        </Button>
        {deleteDialog}
      </div>

      <div className="relative w-22 shrink-0 self-stretch overflow-hidden bg-muted sm:w-28 md:aspect-2/3 md:w-full md:shrink md:rounded-t-xl">
        <img
          src={book.coverUrl}
          alt={book.title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-background/80 to-transparent opacity-0 transition-opacity group-hover:opacity-30" />
      </div>

      <CardContent className="flex min-h-0 min-w-0 flex-1 flex-col justify-between p-3 sm:p-4">
        <div>
          <div className="mb-2 flex min-w-0 items-start gap-2">
            <h3 className="min-h-10 min-w-0 flex-1 line-clamp-2 text-base leading-snug font-semibold sm:min-h-12 md:min-h-14 md:text-lg">
              {book.title}
            </h3>
            <Badge className="mt-0.5 hidden shrink-0 md:inline-flex">
              {getBookStatusBadgeLabel(book.status, book.suggestedBy)}
            </Badge>
          </div>
          <p className="mb-2 line-clamp-2 text-sm text-muted-foreground md:mb-3">
            {book.author}
          </p>
          <Badge className="mb-3 w-fit md:hidden">
            {getBookStatusBadgeLabel(book.status, book.suggestedBy)}
          </Badge>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex min-w-0 origin-left scale-90 items-center gap-1 md:scale-100">
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
            <span className="shrink-0 text-sm font-semibold tabular-nums">
              {averageRating.toFixed(1)}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <div className="flex min-w-0 items-center gap-1">
              <LuCalendarDays size={20} className="shrink-0" />
              <span className="truncate">{formatMonthYear(book.addedAt)}</span>
            </div>
            <span className="shrink-0">
              {reviewsCount} {reviewsCount === 1 ? "avaliação" : "avaliações"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
