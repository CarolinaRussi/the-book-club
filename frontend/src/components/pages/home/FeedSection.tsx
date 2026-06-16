import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchMyFeed } from "@/api/queries/fetchFeed";
import type { IFeedActivity } from "@/types/IFeed";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import FeedActivityCard from "./FeedActivityCard";
import HomeEmptyState from "./HomeEmptyState";

const FEED_PAGE_SIZE = 10;

export default function FeedSection() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<IFeedActivity[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  const { data, isPending, isFetching, isError, refetch } = useQuery({
    queryKey: ["myFeed", user?.id, page],
    queryFn: () => fetchMyFeed(page, FEED_PAGE_SIZE),
    staleTime: 1000 * 60 * 5,
    enabled: !!user,
  });

  useEffect(() => {
    setPage(1);
    setItems([]);
    setTotalPages(0);
  }, [user?.id]);

  useEffect(() => {
    if (!data) return;
    setTotalPages(data.totalPages);
    setItems((prev) => (page === 1 ? data.data : [...prev, ...data.data]));
  }, [data, page]);

  const hasMore = page < totalPages;
  const isInitialLoading = isPending && page === 1 && items.length === 0;
  const isLoadingMore = isFetching && page > 1;
  const showEndMessage =
    items.length > 0 && !hasMore && !isFetching && !isError;

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
      ) : isError && items.length === 0 ? (
        <HomeEmptyState
          icon={<BookOpen className="h-8 w-8" />}
          message="Não foi possível carregar as atualizações. Tente novamente."
          actionLabel="Tentar novamente"
          onAction={() => refetch()}
        />
      ) : items.length > 0 ? (
        <>
          <div className="flex flex-col gap-4">
            {items.map((activity) => (
              <FeedActivityCard key={activity.id} activity={activity} />
            ))}
          </div>

          {isLoadingMore ? (
            <Skeleton className="h-12 w-full rounded-xl" />
          ) : null}

          {isError ? (
            <div className="flex flex-col items-center gap-2 text-center">
              <p className="text-sm text-muted-foreground">
                Erro ao carregar mais itens.
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Tentar novamente
              </Button>
            </div>
          ) : null}

          {hasMore && !isError ? (
            <Button
              variant="outline"
              className="w-full rounded-xl"
              disabled={isFetching}
              onClick={() => setPage((prev) => prev + 1)}
            >
              {isFetching ? "Carregando…" : "Carregar mais"}
            </Button>
          ) : null}

          {showEndMessage ? (
            <p className="text-center text-sm text-muted-foreground py-2">
              Você viu todas as atualizações recentes.
            </p>
          ) : null}
        </>
      ) : (
        <HomeEmptyState
          icon={<BookOpen className="h-8 w-8" />}
          message="Ninguém finalizou um livro ainda nos seus clubes — incluindo você. Marque o seu na Biblioteca!"
          actionLabel="Ir para a Biblioteca"
          actionTo="/library"
        />
      )}
    </section>
  );
}
