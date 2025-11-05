import { Card } from "../components/ui/card";
import { IBook, IOpenLibraryBook } from "../types/IBooks";
import { formatMonthYear, getInitials } from "../utils/formatters";
import { Rating } from "react-simple-star-rating";
import { LuCalendarDays } from "react-icons/lu";
import { FaPlus } from "react-icons/fa6";
import { useState } from "react";
import { Button } from "../components/ui/button";
import CreateBookDialog from "../components/dialogs/CreateBookDialog";

export default function Library() {
  const [createBookOpen, setCreateBookOpen] = useState(false);

  const clubBooks: IBook[] = [
    {
      id: "1",
      name: "O nome do vento (A Crônica do Matador do Rei - Livro 1)",
      author: "Patrick Rothfuss",
      createdAt: "2025-11-02T02:42:39.623Z",
      reviews: [
        {
          id: "1",
          userId: "2",
          rating: 2.5,
          review: "não fede nem cheira",
        },
        {
          id: "2",
          userId: "1",
          rating: 4,
          review: "gostei muito!",
        },
      ],
      image_url: "https://m.media-amazon.com/images/I/81CGmkRG9GL._SL1500_.jpg",
    },
    {
      id: "2",
      name: "Uma Janela Sombria",
      author: "Rachel Gillig",
      createdAt: "2025-10-02T02:42:39.623Z",
      reviews: [
        {
          id: "1",
          userId: "2",
          rating: 5.0,
          review: "PERFEITO",
        },
        {
          id: "2",
          userId: "1",
          rating: 4,
          review: "Adoreeei!",
        },
      ],
      image_url:
        "https://m.media-amazon.com/images/I/41h4qcv+umL._SY445_SX342_ML2_.jpg",
    },
    {
      id: "3",
      name: "Caçador sem coração (Mariposa Escarlate - Livro 1)",
      author: "Kristen Ciccarelli",
      createdAt: "2025-09-02T02:42:39.623Z",
      reviews: [
        {
          id: "1",
          userId: "2",
          rating: 4.5,
          review: "Enemies to lovers incrível!",
        },
        {
          id: "2",
          userId: "1",
          rating: 3.5,
          review: "Poderia ter sido um pouco menos infantil",
        },
      ],
      image_url: "https://m.media-amazon.com/images/I/819kt0LhQmL._SY425_.jpg",
    },
  ];

  return (
    <div className="flex flex-col w-full max-w-7xl">
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-col items-start">
          <h1 className="text-4xl font-bold text-foreground ">
            Nossa Biblioteca
          </h1>
          <h2 className="text-md w-full text-warm-brown">
            Todos os livros que já lemos juntas, com avaliações e reviews
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
        {clubBooks.map((book) => {
          const reviews = book.reviews || [];
          const totalRating = reviews.reduce(
            (acc, review) => acc + review.rating,
            0
          );
          const averageRating =
            reviews.length > 0 ? totalRating / reviews.length : 0;

          return (
            <Card key={book.id} className="flex flex-row gap-3 p-8">
              <div className="shrink-0">
                {book.image_url ? (
                  <img
                    src={book.image_url}
                    alt="Capa do Livro"
                    className="h-52 w-36 object-cover rounded-2xl"
                  />
                ) : (
                  <div className="flex h-52 w-36 items-center justify-center rounded-2xl bg-muted">
                    <span className="text-4xl text-primary">
                      {getInitials(book.name || "")}
                    </span>
                  </div>
                )}
              </div>
              <div className="h-52 flex-1 flex flex-col justify-between">
                <div className="flex flex-row justify-between">
                  <div className="text-2xl font-semibold text-foreground">
                    {book.name}
                  </div>
                </div>
                <div className="text-foreground/70 text-1xl">{book.author}</div>
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
                  Lido em {formatMonthYear(book.createdAt)}
                </div>
                <div className="text-foreground/70">
                  {reviews.length} reviews
                </div>
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
