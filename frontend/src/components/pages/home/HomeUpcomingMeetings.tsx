import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router";
import { Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useClub } from "@/contexts/ClubContext";
import { fetchMyUpcomingMeetings } from "@/api/queries/fetchUpcomingMeetings";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDayMonthYear, formatTime } from "@/utils/formatters";

type HomeUpcomingMeetingsProps = {
  maxItems?: number;
  className?: string;
};

export default function HomeUpcomingMeetings({
  maxItems = 5,
  className,
}: HomeUpcomingMeetingsProps) {
  const { user } = useAuth();
  const { setSelectedClubId } = useClub();
  const navigate = useNavigate();

  const { data, isPending } = useQuery({
    queryKey: ["myUpcomingMeetings", user?.id],
    queryFn: () => fetchMyUpcomingMeetings(5),
    staleTime: 1000 * 60 * 5,
    enabled: !!user,
  });

  const meetings = (data?.data ?? []).slice(0, maxItems);

  const handleMeetingClick = (clubId: string) => {
    setSelectedClubId(clubId);
    navigate("/meetings");
  };

  return (
    <Card className={cn("w-full gap-2", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-primary" />
          Próximos encontros
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {isPending ? (
          <>
            <Skeleton className="h-14 w-full rounded-lg" />
            <Skeleton className="h-14 w-full rounded-lg" />
          </>
        ) : meetings.length > 0 ? (
          <>
            <ul className="flex flex-col gap-2">
              {meetings.map((meeting) => (
                <li key={meeting.id}>
                  <button
                    type="button"
                    onClick={() => handleMeetingClick(meeting.club.id)}
                    className="w-full rounded-lg border border-border bg-background p-3 text-left transition-colors hover:bg-muted/60"
                  >
                    <p className="font-medium text-sm text-primary truncate">
                      {meeting.club.name}
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {formatDayMonthYear(meeting.meetingDate)} ·{" "}
                      {formatTime(meeting.meetingTime)}
                    </p>
                    {meeting.book && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {meeting.book.title}
                      </p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
            <Button variant="link" className="h-auto p-0 self-start" asChild>
              <Link to="/meetings">Ver encontros</Link>
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Nenhum encontro marcado nos seus clubes.
            </p>
            <Button variant="link" className="h-auto p-0 self-start" asChild>
              <Link to="/meetings">Ver encontros</Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
