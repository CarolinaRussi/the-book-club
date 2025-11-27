import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../contexts/AuthContext";
import { Rating } from "react-simple-star-rating";
import { Badge } from "../../ui/badge";
import { Card, CardContent } from "../../ui/card";
import { LuCalendarDays } from "react-icons/lu";
import { useEffect, useState } from "react";
import { fetchPaginatedUserBooks } from "@//api/queries/fetchBooks";
import { formatDayMonthYear } from "@//utils/formatters";
import Pagination from "../../ui/pagination";
// import { formatMonthYear } from "@//utils/formatters";

export default function MyReadings() {
  const { user } = useAuth();
  const [booksPage, setBooksPage] = useState(1);
  const itemsPerPage = 15;

  if (!user) {
    return null;
  }

  const { data: userBooksData, isFetching } = useQuery({
    queryKey: ["bookUsers", user.id, booksPage],
    queryFn: () => fetchPaginatedUserBooks(user.id, booksPage, itemsPerPage),
    staleTime: 1000 * 60 * 5,
    enabled: !!user,
  });

  const userBooks = userBooksData?.data || [];
  const totalPages = userBooksData?.totalPages || 1;

  const handlePageChange = (page: number) => {
    setBooksPage(page);
    //window.scrollTo({ top: 200, behavior: "smooth" }); //nao sei se eu gosto disso ainda
  };

  useEffect(() => {
    setBooksPage(1);
  }, [user.id]);

  return (
    <div className="flex flex-col w-full mt-6">
      <div className="grid grid-cols-5 gap-4 mb-6">
        {userBooks &&
          userBooks.length > 0 &&
          !isFetching &&
          userBooks.map((userBook) => (
            <Card
              key={userBook.book.id}
              className="cursor-pointer hover:shadow-(--shadow-medium) transition-all overflow-hidden group py-0 gap-0 max-w-sm mx-auto md:max-w-none md:mx-0"
              // onClick={() => {
              //   setBookToUpdate(book);
              //   setUpdateBookOpen(true);
              // }}
            >
              <div className="relative aspect-2/3 overflow-hidden bg-muted">
                <img
                  src={userBook.book.cover_url}
                  alt={userBook.book.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-30 transition-opacity" />
              </div>

              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold line-clamp-2 flex-1">
                    {userBook.book.title}
                  </h3>
                  <Badge className="ml-2 shrink-0">Completo</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {userBook.book.author}
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  {userBook.book.reviews && userBook.book.reviews.length > 0
                    ? `"${userBook.book.reviews[0].comment}"`
                    : "Sem avaliação"}
                </p>

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <Rating
                      initialValue={5}
                      readonly
                      allowFraction
                      SVGstyle={{ display: "inline" }}
                      size={25}
                      fillColor="#be2c3f"
                      emptyColor="#e2cad0"
                    />
                  </div>
                  <span className="text-sm font-semibold">5.0</span>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <LuCalendarDays size={20} />
                    {formatDayMonthYear(userBook.updated_at)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
      {userBooks.length > 0 && totalPages > 1 && (
        <div className="mt-8 flex justify-center w-full">
          <Pagination
            currentPage={booksPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
