import { Plus } from "lucide-react";
import meeting from "../assets/meeting.png";
import { Button } from "../components/ui/button";
import { useClub } from "../contexts/ClubContext";
import { useQuery } from "@tanstack/react-query";
import {
  fetchMeetingsByClubId,
  fetchPastMeetingsByClubId,
} from "../api/queries/fetchMeetings";
import type { IMeeting } from "../types/IMeetings";
import { useState, useEffect } from "react";
import CreateMeetingDialog from "../components/pages/meetings/CreateMeetingDialog";
import MeetingHistoryList from "../components/pages/meetings/meetingHistoryList";
import NextMeetingList from "../components/pages/meetings/nextMeetingList";
import NextMeetingBook from "../components/pages/meetings/nextMeetingBook";
import { MEETING_STATUS_SCHEDULED } from "../utils/constants/meeting";

export default function Meetings() {
  const { selectedClubId } = useClub();
  const [createMeetingOpen, setCreateMeetingOpen] = useState(false);
  const [pastMeetingsPage, setPastMeetingsPage] = useState(1);
  const itemsPerPage = 4;

  const { data: meetings, isLoading } = useQuery<IMeeting[]>({
    queryKey: ["meetings", selectedClubId],
    queryFn: () => fetchMeetingsByClubId(selectedClubId),
    staleTime: 1000 * 60 * 5,
    enabled: !!selectedClubId,
  });

  const scheduledMeetings = meetings?.filter(
    (meeting) => meeting.status === MEETING_STATUS_SCHEDULED
  );

  const veryNextMeeting = scheduledMeetings?.[0];
  const nextBook = veryNextMeeting?.book;

  const { data: pastMeetingsData, isLoading: isLoadingPastMeetings } = useQuery(
    {
      queryKey: ["pastMeetings", selectedClubId, pastMeetingsPage],
      queryFn: () =>
        fetchPastMeetingsByClubId(
          selectedClubId,
          pastMeetingsPage,
          itemsPerPage
        ),
      staleTime: 1000 * 60 * 5,
      enabled: !!selectedClubId,
    }
  );

  useEffect(() => {
    setPastMeetingsPage(1);
  }, [selectedClubId]);

  return (
    <div className="min-h-screen w-full">
      <section className="relative h-[300px] ">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${meeting})` }}
        >
          <div className="absolute inset-0 bg-linear-to-r from-background/95 via-background/80 to-background/60" />
        </div>
        <div className="container relative mx-auto px-4 h-full flex items-end">
          <div className="max-w-2xl p-5 md:px-20">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Encontros
            </h1>
            <p className="text-xl text-muted-foreground">
              Onde nos encontramos para discutir o livro da vez enquanto
              saboreamos um café quentinho!
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto p-5 md:px-20 md:py-10 grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 ">
        <div className="md:col-span-2 space-y-6 mt-2">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold px-2">Próximos Encontros</h2>
              <div className="flex gap-2">
                <Button size="lg" onClick={() => setCreateMeetingOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Novo Encontro
                </Button>
              </div>
            </div>

            {/* Componente que lista os próximos encontros agendados */}
            <NextMeetingList
              isLoading={isLoading}
              scheduledMeetings={scheduledMeetings}
            />
          </div>

          {/* Componente que lista o histórico de encontros concluídos ou cancelados */}
          <MeetingHistoryList
            isLoading={isLoadingPastMeetings}
            pastMeetings={pastMeetingsData?.data}
            currentPage={pastMeetingsPage}
            totalPages={pastMeetingsData?.totalPages ?? 1}
            onPageChange={setPastMeetingsPage}
          />
        </div>

        {/* Componente que mostra o livro da vez*/}
        <div className="h-full">
          <NextMeetingBook isLoading={isLoading} nextBook={nextBook} />
        </div>
      </div>
      <CreateMeetingDialog
        openDialog={createMeetingOpen}
        onOpenChange={setCreateMeetingOpen}
      />
    </div>
  );
}
