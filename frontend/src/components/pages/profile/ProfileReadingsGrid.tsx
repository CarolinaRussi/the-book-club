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

  const booksWithData = userBooks.filter((ub) => ub.book);

  if (booksWithData.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">{emptyMessage}</p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 mb-6">
        {booksWithData.map((userBook) => (
          <Card
            key={userBook.id}
            className="hover:shadow-(--shadow-medium) transition-all overflow-hidden group py-0 gap-0 max-w-sm mx-auto md:max-w-none md:mx-0"
          >
            <div className="relative aspect-2/3 overflow-hidden bg-muted">
              <img
                src={userBook.book!.coverUrl ?? ""}
                alt={userBook.book!.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-30 transition-opacity" />
            </div>

            <CardContent className="p-4 pt-3">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold line-clamp-2 flex-1">
                  {userBook.book!.title}
                </h3>
                <Badge className="ml-2 shrink-0">Completo</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {userBook.book!.author}
              </p>
              <ProfileReadingComment
                comment={userBook.myComment}
                mode={isPublic ? "expandable" : "fixed-clamp"}
              />

              <div className="flex items-center justify-between mb-3">
                <Rating
                  initialValue={userBook.myRating ?? 0}
                  readonly
                  allowFraction
                  SVGstyle={{ display: "inline" }}
                  size={25}
                  fillColor="#be2c3f"
                  emptyColor="#e2cad0"
                />
                <span className="text-sm font-semibold">
                  {userBook.myRating != null
                    ? userBook.myRating.toFixed(1)
                    : "—"}
                </span>
              </div>

              {showClubBadges &&
              userBook.clubs &&
              userBook.clubs.length > 0 ? (
                <div className="flex w-full min-w-0 flex-row flex-wrap justify-end gap-x-1.5 gap-y-1.5 border-t border-border/60 pt-3">
                  {userBook.clubs.map((c) => (
                    <Badge
                      key={c.id}
                      variant="outline"
                      className="inline-flex min-w-0 max-w-full shrink-0 font-normal text-[0.65rem] leading-tight border-secondary text-muted-foreground sm:text-xs"
                    >
                      <span className="min-w-0 truncate">{c.name}</span>
                    </Badge>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center w-full">
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
