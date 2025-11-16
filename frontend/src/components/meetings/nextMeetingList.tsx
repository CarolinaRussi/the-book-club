import { Book, Calendar, Clock, Edit, MapPin } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import type { IMeeting } from "@//types/IMeetings";
import EditMeetingDialog from "../dialogs/EditMeetingDialog";
import { useState } from "react";
import { formatDayMonthYear, formatTime } from "@//utils/formatters";

interface NextMeetingListProps {
  isLoading: boolean;
  scheduledMeetings: IMeeting[] | undefined;
}

const NextMeetingList = ({
  isLoading,
  scheduledMeetings,
}: NextMeetingListProps) => {
  const [editMeetingOpen, setEditMeetingOpen] = useState(false);
  const [meetingToUpdate, setMeetingToUpdate] = useState<IMeeting | undefined>(
    undefined
  );

  return (
    <div className="space-y-4">
      {isLoading ? (
        <Card>
          <CardContent className="p-4">
            <p>Carregando encontros...</p>
          </CardContent>
        </Card>
      ) : scheduledMeetings && scheduledMeetings.length > 0 ? (
        scheduledMeetings.map((meeting) => (
          <Card key={meeting.id} className="shadow-(--shadow-soft)">
            <CardContent className=" px-8 relative">
              <div className="flex items-start gap-3 pb-2">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Data e Hora</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDayMonthYear(meeting.meeting_date)}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="h-4 w-4" />
                    {formatTime(meeting.meeting_time)} hrs
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
                    {meeting.book?.title ?? "Ainda não definido"}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2 md:absolute md:right-6 md:top-0 md:mt-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMeetingToUpdate(meeting);
                    setEditMeetingOpen(true);
                  }}
                  className="w-full md:w-auto"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
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
    </div>
  );
};

export default NextMeetingList;
