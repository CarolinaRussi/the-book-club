import { Calendar, MapPin } from "lucide-react";
import { Card, CardContent } from "../../ui/card";
import type { IMeeting } from "@/types/IMeetings";
import { formatDayMonthYear, formatTime } from "@/utils/formatters";
import { formatMeetingBooksLabel } from "@/utils/formatMeetingBooksLabel";
import { Badge } from "../../ui/badge";
import Pagination from "../../ui/pagination";
import {
  MEETING_STATUS_COMPLETED,
  meetingStatusLabels,
} from "@/utils/constants/meeting";
import { useAuth } from "@/contexts/AuthContext";
import { useClub } from "@/contexts/ClubContext";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import EditMeetingDialog from "./EditMeetingDialog";
import { cn } from "@/lib/utils";

interface MeetingHistoryListProps {
  pastMeetings: IMeeting[] | undefined;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  focusMeetingId?: string | null;
  onFocusHandled?: () => void;
}

const MeetingHistoryList = ({
  pastMeetings,
  currentPage,
  totalPages,
  onPageChange,
  focusMeetingId = null,
  onFocusHandled,
}: MeetingHistoryListProps) => {
  const { user } = useAuth();
  const { clubs, selectedClubId } = useClub();
  const selectedClub = clubs.find((club) => club.id === selectedClubId);
  const isAdminOfSelectedClub = !!(
    user &&
    selectedClub &&
    selectedClub.ownerId === user.id
  );

  const [editOpen, setEditOpen] = useState(false);
  const [meetingToEdit, setMeetingToEdit] = useState<IMeeting | undefined>();
  const [initialRecapExpanded, setInitialRecapExpanded] = useState(false);
  const [highlightedMeetingId, setHighlightedMeetingId] = useState<
    string | null
  >(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const handledFocusIdRef = useRef<string | null>(null);

  const handlePageChange = (page: number) => {
    onPageChange(page);
  };

  const openCompletedEditor = (meeting: IMeeting, expandRecap: boolean) => {
    setMeetingToEdit(meeting);
    setInitialRecapExpanded(expandRecap);
    setEditOpen(true);
  };

  useEffect(() => {
    if (!focusMeetingId || !pastMeetings?.length) return;
    if (handledFocusIdRef.current === focusMeetingId) return;

    const focusedMeeting = pastMeetings.find(
      (meetingRow) => meetingRow.id === focusMeetingId,
    );
    if (!focusedMeeting) return;

    handledFocusIdRef.current = focusMeetingId;
    setHighlightedMeetingId(focusMeetingId);

    requestAnimationFrame(() => {
      cardRefs.current[focusMeetingId]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });

    if (
      isAdminOfSelectedClub &&
      focusedMeeting.status === MEETING_STATUS_COMPLETED
    ) {
      openCompletedEditor(focusedMeeting, !focusedMeeting.recap);
    }

    onFocusHandled?.();
  }, [
    focusMeetingId,
    pastMeetings,
    isAdminOfSelectedClub,
    onFocusHandled,
  ]);

  useEffect(() => {
    if (!highlightedMeetingId) return;
    const timeoutId = window.setTimeout(() => {
      setHighlightedMeetingId(null);
    }, 4000);
    return () => window.clearTimeout(timeoutId);
  }, [highlightedMeetingId]);

  return (
    <>
      <div className="rounded-2xl p-2">
        <h2 className="text-2xl font-bold mb-4">Histórico de Encontros</h2>
        <div className="space-y-4">
          {pastMeetings && pastMeetings.length > 0 ? (
            pastMeetings.map((meeting) => {
              const isCompleted = meeting.status === MEETING_STATUS_COMPLETED;
              const recapPreview = meeting.recap?.text?.trim();
              const isHighlighted = highlightedMeetingId === meeting.id;

              return (
                <Card
                  key={meeting.id}
                  ref={(element) => {
                    cardRefs.current[meeting.id] = element;
                  }}
                  className={cn(
                    "shadow-(--shadow-soft) py-3 transition-shadow",
                    isHighlighted && "ring-2 ring-primary shadow-md",
                  )}
                >
                  <CardContent className="flex flex-col gap-4 px-4 sm:flex-row sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex gap-3 mb-2">
                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium text-sm">Data e Hora</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDayMonthYear(meeting.meetingDate)} às{" "}
                            {formatTime(meeting.meetingTime)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="font-medium text-sm">Local</p>
                          <p className="text-sm text-muted-foreground">
                            {meeting.location}
                          </p>
                        </div>
                      </div>

                      {isCompleted && meeting.recap ? (
                        <div className="mt-3 flex gap-3 rounded-md border border-secondary/50 p-3">
                          {meeting.recap.imageUrl ? (
                            <img
                              src={meeting.recap.imageUrl}
                              alt=""
                              className="h-16 w-16 shrink-0 rounded object-cover"
                            />
                          ) : null}
                          <div className="min-w-0">
                            <p className="text-sm font-medium">Registro</p>
                            {recapPreview ? (
                              <p className="text-sm text-muted-foreground line-clamp-3">
                                {recapPreview}
                              </p>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                Registro com foto
                              </p>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-col justify-between items-stretch sm:items-end shrink-0 gap-3 sm:gap-0">
                      <div className="text-start sm:text-end">
                        <p className="font-regular text-sm text-muted-foreground">
                          {(meeting.books?.length ?? 0) > 1
                            ? "Livros discutidos:"
                            : "Livro discutido:"}
                        </p>
                        <p className="font-medium text-sm truncate max-w-[14rem] sm:ml-auto">
                          {formatMeetingBooksLabel(meeting.books)}
                        </p>
                        {meeting.chapterStart != null &&
                          meeting.chapterEnd != null && (
                            <p className="text-sm text-muted-foreground">
                              Capítulos {meeting.chapterStart} a{" "}
                              {meeting.chapterEnd}
                            </p>
                          )}
                      </div>
                      <div className="flex flex-col items-stretch sm:items-end gap-1.5">
                        <Badge className="self-start sm:self-end">
                          Encontro{" "}
                          {meetingStatusLabels[meeting.status].toLowerCase()}
                        </Badge>

                        {isCompleted && isAdminOfSelectedClub ? (
                          <Button
                            type="button"
                            variant={meeting.recap ? "outline" : "secondary"}
                            size="sm"
                            className="w-full"
                            onClick={() =>
                              openCompletedEditor(meeting, !meeting.recap)
                            }
                          >
                            {meeting.recap
                              ? "Editar encontro"
                              : "Registrar encontro"}
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <p className="text-muted-foreground px-2">
              Nenhum encontro no histórico.
            </p>
          )}
        </div>
      </div>
      {pastMeetings && pastMeetings.length > 0 && totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      <EditMeetingDialog
        key={`${meetingToEdit?.id}-${initialRecapExpanded}`}
        openDialog={editOpen}
        onOpenChange={setEditOpen}
        meeting={meetingToEdit}
        initialRecapExpanded={initialRecapExpanded}
      />
    </>
  );
};

export default MeetingHistoryList;
