import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { useClub } from "../contexts/ClubContext";
import { fetchReadersByClubId } from "../api/queries/fetchReaders";
import { formatDayMonthYear, getInitials } from "../utils/formatters";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import SkeletonReaders from "../components/pages/readers/Skeleton";

export default function Readers() {
  const { selectedClubId } = useClub();

  const { data: readers, isFetching } = useQuery({
    queryKey: ["readers", selectedClubId],
    queryFn: () => fetchReadersByClubId(selectedClubId),
    staleTime: 1000 * 60 * 5,
    enabled: !!selectedClubId,
  });

  return (
    <div className="flex flex-col w-full max-w-7xl p-5 md:p-20">
      <div className="flex flex-col items-start">
        <h1 className="text-4xl font-bold text-foreground ">
          Leitores do Clube
        </h1>
        <h2 className="text-md mt-3 w-full text-warm-brown">
          Conheça os leitores apaixonados que fazem parte do nosso clube!
        </h2>
      </div>
      {isFetching ? (
        <SkeletonReaders />
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {selectedClubId && readers && readers.length > 0 ? (
            readers.map((reader) => (
              <div
                key={reader.user.id}
                className="flex flex-col items-center border border-secondary rounded-lg p-8 bg-background shadow-md"
              >
                <Avatar className="mb-4 size-30 ">
                  <AvatarImage
                    src={reader.user.profile_picture}
                    alt={`Foto de perfil de ${reader.user.name}`}
                  />
                  <AvatarFallback
                    className="text-4xl text-primary"
                    delayMs={600}
                  >
                    {getInitials(reader.user.name)}
                  </AvatarFallback>
                </Avatar>
                <h1 className="text-2xl font-bold text-center text-foreground mb-3">
                  {reader.user.nickname}
                </h1>
                {reader.user.bio && (
                  <div className="text-sm text-muted-foreground text-center mb-3">
                    {reader.user.bio}
                  </div>
                )}
                <div className="text-sm text-muted-foreground text-center">
                  Membro desde: <p>{formatDayMonthYear(reader.joined_at)}</p>
                </div>
              </div>
            ))
          ) : (
            <Card className="md:col-span-4 text-center">
              <CardHeader>
                <CardTitle>Nenhum clube por aqui... ainda!</CardTitle>
                <CardDescription>
                  Que tal criar seu próprio clube ou entrar em um com um
                  convite?
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
