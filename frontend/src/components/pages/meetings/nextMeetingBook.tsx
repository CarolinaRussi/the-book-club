import { useEffect, useState } from "react";
import type { IBook } from "@/types/IBooks";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Book } from "lucide-react";
import { cn } from "@/lib/utils";

interface NextMeetingBookProps {
  books: IBook[];
  chapterStart?: number | null;
  chapterEnd?: number | null;
}

function BookSlide({
  book,
  chapterStart,
  chapterEnd,
  showChapters,
}: {
  book: IBook;
  chapterStart?: number | null;
  chapterEnd?: number | null;
  showChapters: boolean;
}) {
  return (
    <Card className="overflow-hidden group py-0 gap-0 max-w-sm mx-auto md:max-w-none md:mx-0 hover:shadow-(--shadow-medium) transition-all">
      <div className="relative aspect-2/3 overflow-hidden bg-muted">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Book className="h-16 w-16 text-muted-foreground/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-30 transition-opacity" />
      </div>
      <CardContent className="py-10">
        <h3 className="text-3xl font-semibold line-clamp-2 flex-1">
          {book.title}
        </h3>
        {book.author ? (
          <p className="text-lg text-muted-foreground">{book.author}</p>
        ) : null}
        {showChapters && chapterStart != null && chapterEnd != null ? (
          <p className="text-sm text-muted-foreground mt-2">
            Capítulos {chapterStart} a {chapterEnd}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

const NextMeetingBook = ({
  books,
  chapterStart,
  chapterEnd,
}: NextMeetingBookProps) => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const heading = books.length > 1 ? "Livros da vez" : "Livro da Vez";

  useEffect(() => {
    if (!carouselApi) return;

    const syncIndex = () => {
      setCurrentIndex(carouselApi.selectedScrollSnap());
    };

    syncIndex();
    carouselApi.on("select", syncIndex);
    carouselApi.on("reInit", syncIndex);

    return () => {
      carouselApi.off("select", syncIndex);
      carouselApi.off("reInit", syncIndex);
    };
  }, [carouselApi]);

  return (
    <div className="hidden md:block max-w-md h-full">
      <h2 className="text-2xl font-bold mb-4">{heading}</h2>
      {books.length === 0 ? (
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
      ) : books.length === 1 ? (
        <BookSlide
          book={books[0]!}
          chapterStart={chapterStart}
          chapterEnd={chapterEnd}
          showChapters
        />
      ) : (
        <div className="space-y-3">
          <Carousel
            setApi={setCarouselApi}
            opts={{ loop: true, align: "start" }}
            className="w-full"
          >
            <CarouselContent>
              {books.map((book) => (
                <CarouselItem key={book.id}>
                  <BookSlide
                    book={book}
                    chapterStart={chapterStart}
                    chapterEnd={chapterEnd}
                    showChapters={false}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious
              className="left-2 top-[min(40%,12rem)] border-background/80 bg-background/90 shadow-sm"
              type="button"
            />
            <CarouselNext
              className="right-2 top-[min(40%,12rem)] border-background/80 bg-background/90 shadow-sm"
              type="button"
            />
          </Carousel>
          <div className="flex items-center justify-center gap-2">
            {books.map((book, index) => (
              <button
                key={book.id}
                type="button"
                aria-label={`Ir para livro ${index + 1}`}
                className={cn(
                  "h-2 w-2 rounded-full transition-colors",
                  index === currentIndex
                    ? "bg-primary"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                onClick={() => carouselApi?.scrollTo(index)}
              />
            ))}
            <span className="ml-1 text-xs text-muted-foreground tabular-nums">
              {currentIndex + 1}/{books.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NextMeetingBook;
