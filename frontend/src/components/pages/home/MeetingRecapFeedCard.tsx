import { useNavigate } from "react-router";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MapPin } from "lucide-react";
import type { IFeedActivityBook, IFeedMeetingRecapActivity } from "@/types/IFeed";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  formatRelativeTime,
  getInitials,
  parseLocalDate,
} from "@/utils/formatters";
import MeetingRecapDetailDialog from "./MeetingRecapDetailDialog";

function formatShortDayMonthYear(dateValue: string) {
  const date = parseLocalDate(dateValue);
  if (!date) return "";
  return format(date, "d MMM yyyy", { locale: ptBR });
}

function formatBooksSummary(books: IFeedActivityBook[]) {
  if (books.length === 0) return null;
  if (books.length === 1) return books[0].title;
  const extraCount = books.length - 1;
  return `${books[0].title} +${extraCount} ${extraCount === 1 ? "livro" : "livros"}`;
}

function MeetingRecapVisual({
  imageUrl,
  books,
}: {
  imageUrl: string | null;
  books: IFeedActivityBook[];
}) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        className="h-24 w-16 shrink-0 rounded-md object-cover bg-muted"
      />
    );
  }

  if (books.length === 0) {
    return null;
  }

  if (books.length === 1) {
    const book = books[0];
    return book.coverUrl ? (
      <img
        src={book.coverUrl}
        alt=""
        className="h-24 w-16 shrink-0 rounded-md object-cover bg-muted"
      />
    ) : (
      <div className="h-24 w-16 shrink-0 rounded-md bg-muted" />
    );
  }

  const visibleBooks = books.slice(0, 3);
  const stackWidth = 44 + (visibleBooks.length - 1) * 12;

  return (
    <div className="relative h-24 shrink-0" style={{ width: stackWidth }}>
      {visibleBooks.map((book, index) =>
        book.coverUrl ? (
          <img
            key={book.id}
            src={book.coverUrl}
            alt=""
            className="absolute top-1 h-[5.5rem] w-11 rounded-md object-cover bg-muted shadow-sm ring-2 ring-background"
            style={{ left: index * 12 }}
          />
        ) : (
          <div
            key={book.id}
            className="absolute top-1 h-[5.5rem] w-11 rounded-md bg-muted ring-2 ring-background"
            style={{ left: index * 12 }}
          />
        ),
      )}
    </div>
  );
}

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
  const booksSummary = formatBooksSummary(books);
  const shortDate = formatShortDayMonthYear(meeting.meetingDate);
  const hasMeta = meeting.location || shortDate;
  const hasVisual = imageUrl || books.length > 0;

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
        className="w-full cursor-pointer overflow-hidden transition-[box-shadow,border-color] hover:border-primary/40 hover:shadow-md"
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
              {isOwnActivity ? "Você registrou encontro em" : "Registrou encontro em"}{" "}
              <span className="font-medium text-foreground">{club.name}</span>
            </p>
          </div>
        </CardHeader>
        {hasVisual || hasMeta || text || booksSummary ? (
          <CardContent className="flex gap-4 pt-0">
            {hasVisual ? (
              <MeetingRecapVisual imageUrl={imageUrl} books={books} />
            ) : null}
            <div className="min-w-0 flex-1 space-y-2">
              {hasMeta ? (
                <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm text-muted-foreground">
                  {meeting.location ? (
                    <span className="inline-flex min-w-0 items-center gap-1">
                      <MapPin
                        className="h-3.5 w-3.5 shrink-0"
                        aria-hidden
                      />
                      <span className="truncate">{meeting.location}</span>
                    </span>
                  ) : null}
                  {meeting.location && shortDate ? (
                    <span aria-hidden>·</span>
                  ) : null}
                  {shortDate ? <span className="shrink-0">{shortDate}</span> : null}
                </p>
              ) : null}
              {booksSummary ? (
                <p className="text-sm font-medium leading-snug text-foreground line-clamp-2">
                  {booksSummary}
                </p>
              ) : null}
              {text ? (
                <p className="text-sm text-foreground line-clamp-2">{text}</p>
              ) : null}
            </div>
          </CardContent>
        ) : null}
      </Card>

      <MeetingRecapDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        activity={activity}
      />
    </>
  );
}
