import { useNavigate } from "react-router";
import { useState } from "react";
import { Rating } from "react-simple-star-rating";
import type {
  IFeedActivity,
  IFeedFinishedActivity,
  IFeedMeetingRecapActivity,
} from "@/types/IFeed";
import { useClub } from "@/contexts/ClubContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

type FeedActivityCardProps = {
  activity: IFeedActivity;
};

function pickClubForLibrary(
  clubs: IFeedFinishedActivity["clubs"],
  selectedClubId: string | null,
) {
  if (clubs.length === 0) return null;
  if (selectedClubId && clubs.some((club) => club.id === selectedClubId)) {
    return selectedClubId;
  }
  return clubs[0].id;
}

function FinishedFeedCard({ activity }: { activity: IFeedFinishedActivity }) {
  const { actor, book, clubs, isOwnActivity, rating, comment, updatedAt } =
    activity;
  const { selectedClubId, setSelectedClubId } = useClub();
  const navigate = useNavigate();
  const displayName = actor.nickname || actor.name;
  const libraryClubId = pickClubForLibrary(clubs, selectedClubId);

  const handleOpenProfile = () => {
    if (isOwnActivity) {
      navigate("/me");
      return;
    }
    navigate(`/users/${actor.id}`);
  };

  const handleOpenLibrary = () => {
    if (!libraryClubId) return;
    setSelectedClubId(libraryClubId);
    navigate("/library");
  };

  return (
    <Card className="w-full overflow-hidden">
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
            {isOwnActivity && (
              <Badge variant="secondary" className="text-xs">
                Você
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">
              · {formatRelativeTime(updatedAt)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isOwnActivity ? "Você finalizou" : "Finalizou"}{" "}
            <span className="font-medium text-foreground">{book.title}</span>
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex gap-4 pt-0">
        {book.coverUrl && (
          <img
            src={book.coverUrl}
            alt=""
            className="h-24 w-16 shrink-0 rounded-md object-cover bg-muted"
          />
        )}
        <div className="min-w-0 flex-1 space-y-2">
          {book.author && (
            <p className="text-sm text-muted-foreground">{book.author}</p>
          )}
          {rating != null && (
            <div className="flex items-center gap-2">
              <Rating
                initialValue={rating}
                readonly
                allowFraction
                SVGstyle={{ display: "inline" }}
                size={18}
                fillColor="#be2c3f"
                emptyColor="#e2cad0"
              />
              <span className="text-sm font-semibold tabular-nums">
                {rating.toFixed(1)}
              </span>
            </div>
          )}
          {comment && (
            <p className="text-sm text-foreground line-clamp-3">{comment}</p>
          )}
        </div>
      </CardContent>
      {libraryClubId ? (
        <CardFooter className="pt-0">
          <Button
            variant="link"
            className="h-auto p-0"
            type="button"
            onClick={handleOpenLibrary}
          >
            Ver na biblioteca
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
}

function MeetingRecapFeedCard({
  activity,
}: {
  activity: IFeedMeetingRecapActivity;
}) {
  const { actor, book, club, meeting, text, imageUrl, isOwnActivity, createdAt } =
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
              {isOwnActivity && (
                <Badge variant="secondary" className="text-xs">
                  Você
                </Badge>
              )}
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
        <CardContent className="flex flex-col gap-3 pt-0 sm:flex-row">
          {book?.coverUrl || imageUrl ? (
            <div className="flex gap-3 shrink-0">
              {book?.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt=""
                  className="h-28 w-[4.5rem] rounded-md object-cover bg-muted"
                />
              ) : null}
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt=""
                  className="h-28 w-36 rounded-md object-cover bg-muted"
                />
              ) : null}
            </div>
          ) : null}
          <div className="min-w-0 flex-1 space-y-1">
            {book ? (
              <p className="font-medium text-foreground">{book.title}</p>
            ) : null}
            {book?.author ? (
              <p className="text-sm text-muted-foreground">{book.author}</p>
            ) : null}
            {text ? (
              <p className="text-sm text-foreground line-clamp-4">{text}</p>
            ) : null}
            <p className="text-sm text-muted-foreground">{meeting.location}</p>
          </div>
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

export default function FeedActivityCard({ activity }: FeedActivityCardProps) {
  if (activity.type === "meeting_recap") {
    return <MeetingRecapFeedCard activity={activity} />;
  }
  return <FinishedFeedCard activity={activity} />;
}
