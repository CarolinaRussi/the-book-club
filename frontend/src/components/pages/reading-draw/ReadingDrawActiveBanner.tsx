import { Link, useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Dices } from "lucide-react";
import { fetchActiveReadingDraw } from "@/api/queries/fetchReadingDraw";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useClub } from "@/contexts/ClubContext";
import {
  isReadingDrawLiveStatus,
  READING_DRAW_STATUS_AWAITING_BOOK,
} from "@/utils/constants/readingDraw";

export default function ReadingDrawActiveBanner() {
  const { user } = useAuth();
  const { selectedClubId } = useClub();
  const location = useLocation();

  const { data } = useQuery({
    queryKey: ["activeReadingDraw", selectedClubId],
    queryFn: () => fetchActiveReadingDraw(selectedClubId!),
    enabled: !!user && !!selectedClubId,
    refetchInterval: 5000,
  });

  const readingDraw = data?.readingDraw;
  if (!readingDraw || !isReadingDrawLiveStatus(readingDraw.status)) {
    return null;
  }
  if (location.pathname.startsWith("/sorteio/")) {
    return null;
  }

  const isAwaitingBook =
    readingDraw.status === READING_DRAW_STATUS_AWAITING_BOOK;
  const title = isAwaitingBook
    ? "O sorteio já tem vencedor"
    : "Sorteio da próxima leitura em andamento";
  const detail = isAwaitingBook
    ? "Entre na sala para ver o resultado e concluir."
    : "Indicações abertas neste clube — entre na sala para participar.";

  return (
    <div className="sticky top-0 z-20 border-b border-primary/25 bg-primary text-primary-foreground shadow-[var(--shadow-soft)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6 md:px-8">
        <div className="flex min-w-0 items-start gap-3 sm:items-center">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15 sm:mt-0">
            <Dices className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 space-y-0.5">
            <p className="text-sm font-semibold leading-snug sm:text-base">
              {title}
            </p>
            <p className="text-xs leading-relaxed text-primary-foreground/85 sm:text-sm">
              {detail}
            </p>
          </div>
        </div>
        <Button
          asChild
          size="sm"
          className="w-full shrink-0 bg-primary-foreground text-primary hover:bg-primary-foreground/90 sm:w-auto"
        >
          <Link to={`/sorteio/${readingDraw.shareCode}`}>Entrar na sala</Link>
        </Button>
      </div>
    </div>
  );
}
