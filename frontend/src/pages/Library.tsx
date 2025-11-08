import { Card } from "../components/ui/card";
import { formatMonthYear, getInitials } from "../utils/formatters";
import { Rating } from "react-simple-star-rating";
import { LuCalendarDays } from "react-icons/lu";
import { FaPlus } from "react-icons/fa6";
import { useState } from "react";
import { Button } from "../components/ui/button";
import CreateBookDialog from "../components/dialogs/CreateBookDialog";
import { useBook } from "../contexts/BookContext";

export default function Library() {
  const [createBookOpen, setCreateBookOpen] = useState(false);
  const { booksFromSelectedClub } = useBook();

  return (
    <div className="flex flex-col w-full max-w-7xl">
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-col items-start">
          <h1 className="text-4xl font-bold text-foreground ">
            Nossa Biblioteca
          </h1>
          <h2 className="text-md w-full text-warm-brown">
            Todos os livros que já lemos juntas, com notas e avaliações
          </h2>
        </div>
        <div>
          <Button
            className="font-semibold text-1xl py-6 w-full rounded-xl bg-primary text-background cursor-pointer hover:bg-primary/80"
            onClick={() => setCreateBookOpen(true)}
          >
            <FaPlus size={24} className="text-cream" />
            Adicionar nova leitura
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
        {booksFromSelectedClub.map((book) => {
          const reviews = book.review || [];
          const totalRating = reviews.reduce(
            (acc, review) => acc + review.rating,
            0
          );
          const averageRating =
            reviews.length > 0 ? totalRating / reviews.length : 0;

          return (
            <Card key={book.id} className="flex flex-row gap-3 p-8">
              <div className="shrink-0">
                {book.cover_url ? (
                  <img
                    src={book.cover_url}
                    alt="Capa do Livro"
                    className="h-52 w-36 object-cover rounded-2xl"
                  />
                ) : (
                  <div className="flex h-52 w-36 items-center justify-center rounded-2xl bg-muted">
                    <span className="text-4xl text-primary">
                      {getInitials(book.title || "")}
                    </span>
                  </div>
                )}
              </div>
              <div
                className={`h-52 flex-1 flex flex-col ${
                  book.review && book.review.length > 0
                    ? "justify-between"
                    : "justify-start"
                }`}
              >
                <div className="flex flex-row justify-between">
                  <div className="text-2xl font-semibold text-foreground">
                    {book.title}
                  </div>
                </div>
                <div className="text-foreground/70 text-1xl">{`(${book.author})`}</div>
                {book.review && book.review.length > 0 ? (
                  <>
                    <div className="flex flex-row items-center gap-2">
                      <Rating
                        initialValue={averageRating}
                        readonly
                        allowFraction
                        SVGstyle={{ display: "inline" }}
                        size={25}
                        fillColor="#be2c3f"
                        emptyColor="gray"
                      />
                      <span className="text-1xl mt-1 text-warm-brown font-semibold">
                        {averageRating.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex flex-row gap-2 text-foreground/70">
                      <LuCalendarDays size={20} />
                      Lido em {formatMonthYear(book.created_at)}
                    </div>
                    <div className="text-foreground/70">
                      {reviews.length} reviews
                    </div>
                  </>
                ) : (
                  <div className="text-foreground/80 text-1xl">
                    Esse livro ainda não tem avaliações.
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
      <CreateBookDialog
        open={createBookOpen}
        onOpenChange={setCreateBookOpen}
      />
    </div>
  );
}
