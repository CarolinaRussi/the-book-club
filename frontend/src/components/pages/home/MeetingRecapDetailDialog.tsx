import { useNavigate } from "react-router";
import type { IFeedMeetingRecapActivity } from "@/types/IFeed";
import { useAuth } from "@/contexts/AuthContext";
import { useClub } from "@/contexts/ClubContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";
import {
  formatDayMonthYear,
  formatRelativeTime,
  formatTime,
  getInitials,
} from "@/utils/formatters";

interface MeetingRecapDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity: IFeedMeetingRecapActivity | null;
}

export default function MeetingRecapDetailDialog({
  open,
  onOpenChange,
  activity,
}: MeetingRecapDetailDialogProps) {
  const { user } = useAuth();
  const { clubs, setSelectedClubId } = useClub();
  const navigate = useNavigate();

  if (!activity) return null;

  const { actor, books, club, meeting, text, imageUrl, createdAt } = activity;
  const displayName = actor.nickname || actor.name;
  const clubFromContext = clubs.find((clubRow) => clubRow.id === club.id);
  const isAdminOfClub = !!(
    user &&
    clubFromContext &&
    clubFromContext.ownerId === user.id
  );

  const handleEditMeeting = () => {
    setSelectedClubId(club.id);
    onOpenChange(false);
    navigate(`/meetings?meetingId=${meeting.id}`);
  };

  const metaLine = [
    club.name,
    `${formatDayMonthYear(meeting.meetingDate)} às ${formatTime(meeting.meetingTime)}`,
    meeting.location,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent
        flush
        className="gap-0 p-0 sm:w-full sm:max-w-lg md:max-w-xl lg:max-h-[90vh] lg:overflow-y-auto"
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <ResponsiveDialogHeader className="flex flex-row items-start justify-between gap-3 space-y-0 px-5 pt-5 pb-3 pr-12 text-left sm:px-6 sm:pr-14">
            <div className="min-w-0 flex-1 text-left">
              <ResponsiveDialogTitle className="text-left text-lg font-semibold text-foreground sm:text-xl">
                Registro do encontro
              </ResponsiveDialogTitle>
              <ResponsiveDialogDescription className="mt-1 text-left text-sm leading-snug text-muted-foreground">
                {metaLine}
              </ResponsiveDialogDescription>
            </div>
            {isAdminOfClub ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={handleEditMeeting}
              >
                Editar
              </Button>
            ) : null}
          </ResponsiveDialogHeader>

          <ResponsiveDialogBody className="flex flex-col">
            <div className="flex items-center gap-3 px-5 pb-4 sm:px-6">
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={actor.profilePicture ?? undefined}
                  alt={actor.name}
                />
                <AvatarFallback>{getInitials(actor.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 text-left">
                <p className="truncate text-sm font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatRelativeTime(createdAt)}
                </p>
              </div>
            </div>

            {imageUrl ? (
              <div className="border-y border-border/60 bg-muted/30">
                <img
                  src={imageUrl}
                  alt="Foto do encontro"
                  className="mx-auto h-auto w-full object-contain sm:max-h-[50vh]"
                />
              </div>
            ) : null}

            <div className="flex flex-col gap-4 px-5 py-4 text-left sm:px-6">
              {books.length > 0 ? (
                <div className="flex flex-col gap-3">
                  <p className="text-xs text-muted-foreground">
                    {books.length > 1 ? "Livros da vez" : "Livro da vez"}
                  </p>
                  {books.map((book) => (
                    <div key={book.id} className="flex items-center gap-3">
                      {book.coverUrl ? (
                        <img
                          src={book.coverUrl}
                          alt=""
                          className="h-20 w-14 shrink-0 rounded object-cover bg-muted shadow-sm"
                        />
                      ) : (
                        <div className="h-20 w-14 shrink-0 rounded bg-muted shadow-sm" />
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
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
                  {text}
                </p>
              ) : null}
            </div>
          </ResponsiveDialogBody>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
