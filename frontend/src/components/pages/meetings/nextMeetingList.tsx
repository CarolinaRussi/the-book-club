import { Book, Calendar, CheckCircle2, Clock, Edit, MapPin, RefreshCw } from "lucide-react";
import { Button } from "../../ui/button";
import { Card, CardContent } from "../../ui/card";
import type { IMeeting } from "@/types/IMeetings";
import EditMeetingDialog from "./EditMeetingDialog";
import { useState } from "react";
import { formatDayMonthYear, formatTime } from "@/utils/formatters";
import { LuCalendarX2 } from "react-icons/lu";
import CancelMeetingDialog from "./CancelMeetingDialog";
import CompleteMeetingDialog from "./CompleteMeetingDialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resyncMeetingGoogleCalendar } from "@/api/mutations/meetingMutate";
import { toast } from "react-toastify";
import { Link } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { useClub } from "@/contexts/ClubContext";
import type { IApiError } from "@/types/IApi";

interface NextMeetingListProps {
  scheduledMeetings: IMeeting[] | undefined;
}

const NextMeetingList = ({ scheduledMeetings }: NextMeetingListProps) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { selectedClubId, clubs } = useClub();
  const selectedClub = clubs.find((club) => club.id === selectedClubId);
  const isAdminOfSelectedClub = !!(
    user &&
    selectedClub &&
    selectedClub.ownerId === user.id
  );
  const [editMeetingOpen, setEditMeetingOpen] = useState(false);
  const [meetingToUpdate, setMeetingToUpdate] = useState<IMeeting | undefined>(
    undefined
  );
  const [cancelMeetingOpen, setCancelMeetingOpen] = useState(false);
  const [completeMeetingOpen, setCompleteMeetingOpen] = useState(false);
  const [resyncingId, setResyncingId] = useState<string | null>(null);

  const { mutate: resync } = useMutation({
    mutationFn: resyncMeetingGoogleCalendar,
    onMutate: (id) => {
      setResyncingId(id);
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({
        queryKey: ["meetings", selectedClubId],
      });
      await queryClient.invalidateQueries({ queryKey: ["googleOAuthStatus"] });
      await queryClient.invalidateQueries({ queryKey: ["authenticatedUser"] });
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    },
    onError: (error: IApiError) => {
      toast.error(error.message || "Não foi possível sincronizar.");
    },
    onSettled: () => {
      setResyncingId(null);
    },
  });

  return (
    <div>
      {scheduledMeetings && scheduledMeetings.length > 0 ? (
        scheduledMeetings.map((meeting) => {
          const needsGoogleSync =
            Boolean(meeting.googleSyncError) ||
            (Boolean(user?.googleConnected) && !meeting.googleEventId);

          return (
            <Card key={meeting.id} className="shadow-(--shadow-soft)">
              <CardContent className=" px-8 relative">
                <div className="flex items-start gap-3 pb-2">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Data e Hora</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDayMonthYear(meeting.meetingDate)}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="h-4 w-4" />
                      {formatTime(meeting.meetingTime)} hrs
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pb-2 md:pb-0">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Local</p>
                    <p className="text-sm text-muted-foreground">
                      {meeting.location}
                    </p>
                  </div>
                </div>
                <div className="md:hidden flex items-start gap-3 pb-4">
                  <Book className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Livro</p>
                    <p className="text-sm text-muted-foreground">
                      {meeting.book?.title ?? "Sem livro"}
                    </p>
                    {meeting.chapterStart != null &&
                      meeting.chapterEnd != null && (
                        <p className="text-sm text-muted-foreground">
                          Capítulos {meeting.chapterStart} a {meeting.chapterEnd}
                        </p>
                      )}
                  </div>
                </div>
                {needsGoogleSync ? (
                  <div className="mt-3 mb-2 rounded-md border border-amber-500/40 bg-amber-500/5 px-3 py-2 text-sm">
                    <p className="font-medium text-foreground">
                      Não sincronizado com o Google Calendar
                    </p>
                    <p className="mt-0.5 text-muted-foreground">
                      {meeting.googleSyncError ??
                        "Este encontro ainda não tem evento no calendário."}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={resyncingId === meeting.id}
                        onClick={() => resync(meeting.id)}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        {resyncingId === meeting.id
                          ? "Sincronizando…"
                          : "Tentar novamente"}
                      </Button>
                      <Link
                        to="/me/account#google-calendar-perfil"
                        className="text-primary text-sm font-medium underline underline-offset-2"
                      >
                        Conta / Google
                      </Link>
                    </div>
                  </div>
                ) : null}
                <div className="mt-4 flex flex-col gap-2 md:flex-row md:flex-wrap md:justify-end md:absolute md:right-6 md:top-0 md:mt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMeetingToUpdate(meeting);
                      setEditMeetingOpen(true);
                    }}
                    className="w-full md:w-auto"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>

                  {isAdminOfSelectedClub ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setMeetingToUpdate(meeting);
                        setCompleteMeetingOpen(true);
                      }}
                      className="w-full md:w-auto"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Concluir encontro
                    </Button>
                  ) : null}

                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      setMeetingToUpdate(meeting);
                      setCancelMeetingOpen(true);
                    }}
                    className="w-full md:w-auto"
                  >
                    <LuCalendarX2 className="mr-1" />
                    Cancelar encontro
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })
      ) : (
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground text-center">
              Ainda não há nenhum encontro marcado.
            </p>
          </CardContent>
        </Card>
      )}
      <EditMeetingDialog
        key={meetingToUpdate?.id}
        openDialog={editMeetingOpen}
        onOpenChange={setEditMeetingOpen}
        meeting={meetingToUpdate}
      />
      {isAdminOfSelectedClub ? (
        <CompleteMeetingDialog
          key={meetingToUpdate?.id}
          openDialog={completeMeetingOpen}
          onOpenChange={setCompleteMeetingOpen}
          meeting={meetingToUpdate}
        />
      ) : null}
      <CancelMeetingDialog
        key={meetingToUpdate?.id}
        openDialog={cancelMeetingOpen}
        onOpenChange={setCancelMeetingOpen}
        meeting={meetingToUpdate}
      />
    </div>
  );
};

export default NextMeetingList;
