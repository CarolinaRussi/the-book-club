import { Calendar, MapPin } from "lucide-react";
import { Card, CardContent } from "../../ui/card";
import type { IMeeting } from "@/types/IMeetings";
import { formatDayMonthYear, formatTime } from "@/utils/formatters";
import { Badge } from "../../ui/badge";
import Pagination from "../../ui/pagination";
import {
  MEETING_STATUS_COMPLETED,
  meetingStatusLabels,
} from "@/utils/constants/meeting";
import { useAuth } from "@/contexts/AuthContext";
import { useClub } from "@/contexts/ClubContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import EditMeetingDialog from "./EditMeetingDialog";

interface MeetingHistoryListProps {
  pastMeetings: IMeeting[] | undefined;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const MeetingHistoryList = ({
  pastMeetings,
  currentPage,
  totalPages,
  onPageChange,
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

  const handlePageChange = (page: number) => {
    onPageChange(page);
  };

  const openCompletedEditor = (
    meeting: IMeeting,
    expandRecap: boolean,
  ) => {
    setMeetingToEdit(meeting);
    setInitialRecapExpanded(expandRecap);
    setEditOpen(true);
  };

  return (
    <>
      <div className="rounded-2xl p-2">
        <h2 className="text-2xl font-bold mb-4">Histórico de Encontros</h2>
        <div className="space-y-4">
          {pastMeetings && pastMeetings.length > 0 ? (
            pastMeetings.map((meeting) => {
              const isCompleted = meeting.status === MEETING_STATUS_COMPLETED;
              const recapPreview = meeting.recap?.text?.trim();

              return (
                <Card key={meeting.id} className="shadow-(--shadow-soft) py-3">
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

                    <div className="flex flex-col justify-between items-stretch sm:items-end gap-3 shrink-0">
                      <div className="text-start sm:text-end">
                        <p className="font-regular text-sm text-muted-foreground">
                          Livro discutido:
                        </p>
                        <p className="font-medium text-sm">
                          {meeting.book?.title ?? "Sem livro"}
                        </p>
                        {meeting.chapterStart != null &&
                          meeting.chapterEnd != null && (
                            <p className="text-sm text-muted-foreground">
                              Capítulos {meeting.chapterStart} a{" "}
                              {meeting.chapterEnd}
                            </p>
                          )}
                      </div>
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
