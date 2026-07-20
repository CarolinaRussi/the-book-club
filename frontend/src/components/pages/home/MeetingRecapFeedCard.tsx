import { useNavigate } from "react-router";
import { useState } from "react";
import type { IFeedMeetingRecapActivity } from "@/types/IFeed";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  formatDayMonthYear,
  formatRelativeTime,
  getInitials,
} from "@/utils/formatters";
import MeetingRecapDetailDialog from "./MeetingRecapDetailDialog";

export function MeetingRecapFeedCard({
  activity,
}: {
  activity: IFeedMeetingRecapActivity;
}) {
  const { actor, books, club, meeting, text, imageUrl, isOwnActivity, createdAt } =
    activity;
  const navigate = useNavigate();
  const displayName = actor.nickname || actor.name;
  const [detailOpen, setDetailOpen] = useState(false);

  const handleOpenProfile = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (isOwnActivity) {
      navigate("/me");
      return;
    }
    navigate(`/users/${actor.id}`);
  };

  const handleOpenDetail = () => {
    setDetailOpen(true);
  };

  return (
    <>
      <Card
        className="w-full overflow-hidden cursor-pointer transition-colors hover:bg-muted/20"
        onClick={handleOpenDetail}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleOpenDetail();
          }
        }}
      >
        <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-3">
          <button
            type="button"
            onClick={handleOpenProfile}
            className="shrink-0 rounded-full cursor-pointer transition-opacity hover:opacity-80"
            aria-label={`Ver perfil de ${displayName}`}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={actor.profilePicture ?? undefined}
                alt={actor.name}
              />
              <AvatarFallback>{getInitials(actor.name)}</AvatarFallback>
            </Avatar>
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleOpenProfile}
                className="font-semibold text-foreground cursor-pointer transition-colors hover:text-primary"
              >
                {displayName}
              </button>
              {isOwnActivity ? (
                <Badge variant="secondary" className="text-xs">
                  Você
                </Badge>
              ) : null}
              <span className="text-sm text-muted-foreground">
                · {formatRelativeTime(createdAt)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isOwnActivity ? "Você registrou" : "Registrou"} o encontro de{" "}
              <span className="font-medium text-foreground">
                {formatDayMonthYear(meeting.meetingDate)}
              </span>{" "}
              em{" "}
              <span className="font-medium text-foreground">{club.name}</span>
            </p>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pt-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className="h-28 w-36 rounded-md object-cover bg-muted"
            />
          ) : null}
          {books.length > 0 ? (
            <div className="flex flex-col gap-2">
              {books.map((book) => (
                <div key={book.id} className="flex items-center gap-3">
                  {book.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt=""
                      className="h-16 w-11 shrink-0 rounded-md object-cover bg-muted"
                    />
                  ) : (
                    <div className="h-16 w-11 shrink-0 rounded-md bg-muted" />
                  )}
                  <div className="min-w-0">
                    <p className="font-medium leading-snug text-foreground">
                      {book.title}
                    </p>
                    {book.author ? (
                      <p className="text-sm text-muted-foreground">
                        {book.author}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          {text ? (
            <p className="text-sm text-foreground line-clamp-4">{text}</p>
          ) : null}
          <p className="text-sm text-muted-foreground">{meeting.location}</p>
        </CardContent>
        <CardFooter className="pt-0">
          <span className="text-sm font-medium text-primary">Ver registro</span>
        </CardFooter>
      </Card>

      <MeetingRecapDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        activity={activity}
      />
    </>
  );
}
