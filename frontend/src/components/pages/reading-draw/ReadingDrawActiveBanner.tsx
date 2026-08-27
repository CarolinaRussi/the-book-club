import { Link, useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchActiveReadingDraw } from "@/api/queries/fetchReadingDraw";
import { useAuth } from "@/contexts/AuthContext";
import { useClub } from "@/contexts/ClubContext";
import { isReadingDrawLiveStatus } from "@/utils/constants/readingDraw";

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

  return (
    <div className="mb-4 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-foreground">
          Há um <span className="font-semibold text-primary">sorteio</span>{" "}
          rolando neste clube.
        </p>
        <Link
          to={`/sorteio/${readingDraw.shareCode}`}
          className="text-sm font-semibold text-primary underline-offset-2 hover:underline"
        >
          Entrar na sala
        </Link>
      </div>
    </div>
  );
}
