import {
  Book,
  Calendar,
  Clock,
  Edit,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";
import meeting from "../assets/meeting.png";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useClub } from "../contexts/ClubContext";
import { useQuery } from "@tanstack/react-query";
import { fetchMeetingsByClubId } from "../api/queries/fetchMeetings";
import type { IMeeting } from "../types/IMeetings";
import { useState } from "react";
import CreateMeetingDialog from "../components/dialogs/CreateMeetingDialog";

export default function Meetings() {
  const { selectedClubId } = useClub();
  const [createMeetingOpen, setCreateMeetingOpen] = useState(false);

  const { data: meetings, isLoading } = useQuery<IMeeting[]>({
    queryKey: ["meetings", selectedClubId],
    queryFn: () => fetchMeetingsByClubId(selectedClubId),
    staleTime: 1000 * 60 * 5,
    enabled: !!selectedClubId,
  });

  const scheduledMeetings = meetings?.filter(
    (meeting) => meeting.status === "scheduled"
  );

  const veryNextMeeting = scheduledMeetings?.[0];
  const nextBook = veryNextMeeting?.book;

  const pastMeetings = meetings?.filter(
    (meeting) =>
      meeting.status === "completed" || meeting.status === "cancelled"
  );

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
              Próximo Encontro
            </h1>
            <p className="text-xl text-muted-foreground">
              Junte-se a nós para discutir o livro da vez!
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto p-5 md:px-20 md:py-10 grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 items-start">
        <div className="md:col-span-2 space-y-8 mt-2">
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold px-2">Próximos Encontros</h2>
              <div className="flex gap-2">
                <Button size="lg" onClick={() => setCreateMeetingOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Marcar Novo Encontro
                </Button>
              </div>
            </div>

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
                    <CardContent className="space-y-4 px-8 relative">
                      <div className="absolute right-6 flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                          Editar
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                          Excluir
                        </Button>
                      </div>
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Data e Hora</p>
                          <p className="text-sm text-muted-foreground">
                            {meeting.meeting_date}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="h-4 w-4" />
                            {meeting.meeting_time}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Local</p>
                          <p className="text-sm text-muted-foreground">
                            {meeting.location}
                          </p>
                        </div>
                      </div>

                      <div className="md:hidden flex items-start gap-3">
                        <Book className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Livro</p>
                          <p className="text-sm text-muted-foreground">
                            {meeting.book?.title ?? "Ainda não definido"}
                          </p>
                        </div>
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
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Histórico de Encontros</h2>
            <div className="space-y-4">
              {isLoading ? (
                <p>Carregando histórico...</p>
              ) : pastMeetings && pastMeetings.length > 0 ? (
                pastMeetings.map((meeting) => (
                  <Card
                    key={meeting.id}
                    className="shadow-(--shadow-soft) py-3"
                  >
                    <CardContent className="flex justify-between items-center">
                      <div>
                        <div className="flex gap-3 mb-2">
                          <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium text-sm">Data e Hora</p>
                            <p className="text-sm text-muted-foreground">
                              {meeting.meeting_date} às {meeting.meeting_time}
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
                      <div className="text-end">
                        <p className="font-regular text-sm text-muted-foreground">
                          Livro discutido:
                        </p>
                        <p className="font-medium text-sm">
                          {meeting.book?.title ?? "N/A"}
                        </p>
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
          </section>
        </div>

        <div className="hidden md:block max-w-md">
          <h2 className="text-2xl font-bold mb-4">Livro da Vez</h2>
          {isLoading ? (
            <p>Carregando livro...</p>
          ) : nextBook ? (
            <Card
              key={nextBook.id}
              className="cursor-pointer hover:shadow-(--shadow-medium) transition-all overflow-hidden group py-0 gap-0 max-w-sm mx-auto md:max-w-none md:mx-0"
            >
              <div className="relative aspect-2/3 overflow-hidden bg-muted">
                <img
                  src={nextBook.cover_url}
                  alt={nextBook.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-30 transition-opacity" />
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold line-clamp-2 flex-1 min-h-14">
                    {nextBook.title}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {nextBook.author}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden py-0">
              <CardContent className="p-0">
                <div className="relative aspect-2/3 overflow-hidden bg-muted flex items-center justify-center">
                  <Book className="h-16 w-16 text-muted-foreground/50" />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold min-h-14">
                    Nenhum livro definido
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Nenhum encontro agendado.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <CreateMeetingDialog
        openDialog={createMeetingOpen}
        onOpenChange={setCreateMeetingOpen}
      />
    </div>
  );
}
