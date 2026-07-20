import type { IBook } from "@/types/IBooks";
import { Card, CardContent } from "../../ui/card";
import { Book } from "lucide-react";
import { formatMeetingBooksLabel } from "@/utils/formatMeetingBooksLabel";

interface NextMeetingBookProps {
  books: IBook[];
  chapterStart?: number | null;
  chapterEnd?: number | null;
}

const NextMeetingBook = ({
  books,
  chapterStart,
  chapterEnd,
}: NextMeetingBookProps) => {
  const nextBook = books[0];
  const heading = books.length > 1 ? "Livros da vez" : "Livro da Vez";

  return (
    <div className="hidden md:block max-w-md h-full">
      <h2 className="text-2xl font-bold mb-4">{heading}</h2>
      {nextBook ? (
        <Card
          key={nextBook.id}
          className="cursor-pointer hover:shadow-(--shadow-medium) transition-all overflow-hidden group py-0 gap-0 max-w-sm mx-auto md:max-w-none md:mx-0"
        >
          <div className="relative aspect-2/3 overflow-hidden bg-muted">
            <img
              src={nextBook.coverUrl ?? undefined}
              alt={nextBook.title}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-30 transition-opacity" />
          </div>
          <CardContent className="py-10">
            <div className="flex items-start justify-between">
              <h3 className="text-3xl font-semibold line-clamp-2 flex-1">
                {books.length > 1
                  ? formatMeetingBooksLabel(books, 80)
                  : nextBook.title}
              </h3>
            </div>
            {books.length === 1 ? (
              <p className="text-lg text-muted-foreground">{nextBook.author}</p>
            ) : null}
            {chapterStart != null && chapterEnd != null ? (
              <p className="text-sm text-muted-foreground mt-2">
                Capítulos {chapterStart} a {chapterEnd}
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden group py-0 gap-0 max-w-sm mx-auto md:max-w-none md:mx-0">
          <div className="relative aspect-2/3 overflow-hidden bg-muted flex items-center justify-center">
            <Book className="h-16 w-16 text-muted-foreground/50" />
          </div>
          <CardContent className="py-10">
            <h3 className="text-3xl font-semibold line-clamp-2 flex-1">
              Nenhum livro definido
            </h3>
            <p className="text-lg text-muted-foreground">
              Nenhum encontro agendado.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NextMeetingBook;
