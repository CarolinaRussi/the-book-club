import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { fetchMyFeed } from "@/api/queries/fetchFeed";
import type { IFeedActivity } from "@/types/IFeed";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import FeedActivityCard from "./FeedActivityCard";

const FEED_PAGE_SIZE = 20;

export default function FeedSection() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<IFeedActivity[]>([]);

  const { data, isPending, isFetching } = useQuery({
    queryKey: ["myFeed", user?.id, page],
    queryFn: () => fetchMyFeed(page, FEED_PAGE_SIZE),
    staleTime: 1000 * 60 * 5,
    enabled: !!user,
  });

  useEffect(() => {
    setPage(1);
    setItems([]);
  }, [user?.id]);

  useEffect(() => {
    if (!data) return;
    setItems((prev) => (page === 1 ? data.data : [...prev, ...data.data]));
  }, [data, page]);

  const hasMore =
    data != null && data.currentPage < data.totalPages && items.length > 0;

  const isInitialLoading = isPending && page === 1;

  return (
    <section className="flex flex-col gap-4 min-w-0">
      <h2 className="text-xl font-semibold text-foreground md:sr-only">
        Atualizações
      </h2>

      {isInitialLoading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      ) : items.length > 0 ? (
        <>
          <div className="flex flex-col gap-4">
            {items.map((activity) => (
              <FeedActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
          {hasMore && (
            <Button
              variant="outline"
              className="w-full rounded-xl"
              disabled={isFetching}
              onClick={() => setPage((prev) => prev + 1)}
            >
              {isFetching ? "Carregando…" : "Carregar mais"}
            </Button>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-muted-foreground">
            Ninguém finalizou um livro ainda nos seus clubes — incluindo você.
            Marque o seu na Biblioteca!
          </p>
          <Button variant="link" className="mt-2" asChild>
            <Link to="/library">Ir para a Biblioteca</Link>
          </Button>
        </div>
      )}
    </section>
  );
}
