import type { IBook } from "@//types/IBooks";
import { Card, CardContent } from "../ui/card";
import { Book } from "lucide-react";

interface NextMeetingBookProps {
    isLoading: boolean,
    nextBook: IBook | undefined;
}
const NextMeetingBook = ({isLoading, nextBook}:NextMeetingBookProps) => {
  return (
    <div className="hidden md:block max-w-md">
      <h2 className="text-2xl font-bold mb-4">Livro da Vez</h2>
      {isLoading ? (
        <p>Carregando livro...</p>
      ) : nextBook ? (
        <Card
          key={nextBook.id}
          className="cursor-pointer hover:shadow-(--shadow-medium) transition-all overflow-hidden group py-0 gap-0 max-w-sm mx-auto md:max-w-none md:mx-0"
        >
          <div className="relative aspect-2/3 overflow-hidden bg-muted">
            <img
              src={nextBook.cover_url}
              alt={nextBook.title}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-30 transition-opacity" />
          </div>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold line-clamp-2 flex-1">
                {nextBook.title}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">{nextBook.author}</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden py-0">
          <CardContent className="p-0">
            <div className="relative aspect-2/3 overflow-hidden bg-muted flex items-center justify-center">
              <Book className="h-16 w-16 text-muted-foreground/50" />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold min-h-14">
                Nenhum livro definido
              </h3>
              <p className="text-sm text-muted-foreground">
                Nenhum encontro agendado.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NextMeetingBook;
