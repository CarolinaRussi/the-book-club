import { Calendar, MapPin } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import type { IMeeting } from "@//types/IMeetings";
import { formatDayMonthYear, formatTime } from "@//utils/formatters";
import { Badge } from "../ui/badge";
import Pagination from "../ui/pagination";
import { meetingStatusLabels } from "@//utils/constants/meeting";

interface MeetingHistoryListProps {
  isLoading: boolean;
  pastMeetings: IMeeting[] | undefined;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const MeetingHistoryList = ({
  isLoading,
  pastMeetings,
  currentPage,
  totalPages,
  onPageChange,
}: MeetingHistoryListProps) => {
  const handlePageChange = (page: number) => {
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <div className="rounded-2xl p-2">
        <h2 className="text-2xl font-bold mb-4">Histórico de Encontros</h2>
        <div className="space-y-4">
          {isLoading ? (
            <p>Carregando histórico...</p>
          ) : pastMeetings && pastMeetings.length > 0 ? (
            pastMeetings.map((meeting) => (
              <Card key={meeting.id} className="shadow-(--shadow-soft) py-3">
                <CardContent className="flex justify-between px-4">
                  <div>
                    <div className="flex gap-3 mb-2">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Data e Hora</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDayMonthYear(meeting.meeting_date)} às{" "}
                          {formatTime(meeting.meeting_time)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 ">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Local</p>
                        <p className="text-sm text-muted-foreground">
                          {meeting.location}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between items-end">
                    <div className="text-end">
                      <p className="font-regular text-sm text-muted-foreground">
                        Livro discutido:
                      </p>
                      <p className="font-medium text-sm">
                        {meeting.book?.title ?? "N/A"}
                      </p>
                    </div>
                    <Badge>
                      Encontro{" "}
                      {meetingStatusLabels[meeting.status].toLowerCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground px-2">
              Nenhum encontro no histórico.
            </p>
          )}
        </div>
      </div>
      {!isLoading &&
        pastMeetings &&
        pastMeetings.length > 0 &&
        totalPages > 1 && (
          <div className="mt-4 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
    </>
  );
};

export default MeetingHistoryList;
