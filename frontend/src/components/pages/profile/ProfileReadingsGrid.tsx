import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Rating } from "react-simple-star-rating";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Pagination from "@/components/ui/pagination";
import { fetchPaginatedUserBooks } from "@/api/queries/fetchBooks";
import { fetchUserProfileReadings } from "@/api/queries/fetchUserReadings";
import ProfileReadingComment from "@/components/pages/profile/ProfileReadingComment";
import SkeletonMyReadings from "@/components/pages/me/skeletons/SkeletonMyReadings";

interface ProfileReadingsGridProps {
  userId: string;
  itemsPerPage?: number;
  showClubBadges?: boolean;
  emptyMessage?: string;
  variant?: "self" | "public";
  viewerId?: string | null;
}

export default function ProfileReadingsGrid({
  userId,
  itemsPerPage = 15,
  showClubBadges = true,
  emptyMessage = "Nenhum livro finalizado ainda.",
  variant = "self",
  viewerId = null,
}: ProfileReadingsGridProps) {
  const [booksPage, setBooksPage] = useState(1);
  const isPublic = variant === "public";

  const { data: userBooksData, isFetching } = useQuery({
    queryKey: isPublic
      ? ["userReadings", viewerId, userId, booksPage, "finished"]
      : ["bookUsers", userId, booksPage],
    queryFn: () =>
      isPublic
        ? fetchUserProfileReadings(userId, booksPage, itemsPerPage)
        : fetchPaginatedUserBooks(userId, booksPage, itemsPerPage),
    staleTime: 1000 * 60 * 5,
    enabled: !!userId && (!isPublic || !!viewerId),
  });

  const userBooks = userBooksData?.data || [];
  const totalPages = userBooksData?.totalPages || 1;

  useEffect(() => {
    setBooksPage(1);
  }, [userId]);

  if (isFetching) {
    return <SkeletonMyReadings />;
  }

  const booksWithData = userBooks.filter((userBook) => userBook.book);

  if (booksWithData.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">{emptyMessage}</p>
    );
  }

  return (
    <>
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {booksWithData.map((userBook) => (
          <Card
            key={userBook.id}
            className="group flex w-full flex-row items-stretch gap-0 overflow-hidden py-0 transition-all hover:shadow-(--shadow-medium) md:flex-col"
          >
            <div className="relative w-22 shrink-0 self-stretch overflow-hidden bg-muted sm:w-28 md:aspect-2/3 md:w-full md:shrink">
              <img
                src={userBook.book!.coverUrl ?? ""}
                alt={userBook.book!.title}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-background/80 to-transparent opacity-0 transition-opacity group-hover:opacity-30" />
            </div>

            <CardContent className="flex min-h-0 min-w-0 flex-1 flex-col justify-between p-3 sm:p-4">
              <div>
                <div className="mb-2 flex min-w-0 items-start gap-2">
                  <h3 className="min-w-0 flex-1 text-base font-semibold leading-snug line-clamp-2 md:text-lg">
                    {userBook.book!.title}
                  </h3>
                  <Badge className="mt-0.5 hidden shrink-0 md:inline-flex">
                    Completo
                  </Badge>
                </div>
                <p className="mb-2 line-clamp-2 text-sm text-muted-foreground md:mb-3">
                  {userBook.book!.author}
                </p>
                <Badge className="mb-3 w-fit md:hidden">Completo</Badge>
                <ProfileReadingComment
                  comment={userBook.myComment}
                  mode={isPublic ? "expandable" : "fixed-clamp"}
                />
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="origin-left scale-90 md:scale-100">
                    <Rating
                      initialValue={userBook.myRating ?? 0}
                      readonly
                      allowFraction
                      SVGstyle={{ display: "inline" }}
                      size={25}
                      fillColor="#be2c3f"
                      emptyColor="#e2cad0"
                    />
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums">
                    {userBook.myRating != null
                      ? userBook.myRating.toFixed(1)
                      : "—"}
                  </span>
                </div>

                {showClubBadges &&
                userBook.clubs &&
                userBook.clubs.length > 0 ? (
                  <div className="flex w-full min-w-0 flex-row flex-wrap justify-end gap-x-1.5 gap-y-1.5 border-t border-border/60 pt-3">
                    {userBook.clubs.map((club) => (
                      <Badge
                        key={club.id}
                        variant="outline"
                        className="inline-flex min-w-0 max-w-full shrink-0 border-secondary text-[0.65rem] font-normal leading-tight text-muted-foreground sm:text-xs"
                      >
                        <span className="min-w-0 truncate">{club.name}</span>
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex w-full justify-center">
          <Pagination
            currentPage={booksPage}
            totalPages={totalPages}
            onPageChange={setBooksPage}
          />
        </div>
      )}
    </>
  );
}
