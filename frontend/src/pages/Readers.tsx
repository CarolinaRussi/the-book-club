import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { useClub } from "../contexts/ClubContext";
import { fetchReadersByClubId } from "../api/queries/fetchReaders";
import { useEffect } from "react";

export default function Readers() {
  const { selectedClubId } = useClub();

  const { data: readers, isLoading } = useQuery({
    queryKey: ["readers", selectedClubId],
    queryFn: () => fetchReadersByClubId(selectedClubId),
    staleTime: 1000 * 60 * 5,
    enabled: !!selectedClubId,
  });

  const getInitials = (name: string) => {
    if (!name) return "?";

    return name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className="flex flex-col w-full max-w-7xl">
      <div className="flex flex-col items-start">
        <h1 className="text-4xl font-bold text-foreground ">
          Nossos Participantes
        </h1>
        <h2 className="text-md mt-3 w-full text-warm-brown">
          Conheça as leitoras apaixonadas que fazem parte do nosso clube!
        </h2>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {readers && readers.length > 0 ? (
          readers.map((reader) => (
            <div
              key={reader.id}
              className="flex flex-col items-center border border-secondary rounded-lg p-8 bg-background shadow-md"
            >
              <Avatar className="mb-4 ">
                <AvatarImage
                  src="teste.com"
                  alt="Foto de perfil de Ana Silva"
                />
                <AvatarFallback className="text-4xl text-primary" delayMs={600}>
                  {getInitials(reader.name)}
                </AvatarFallback>
              </Avatar>
              <h1 className="text-2xl font-bold text-center text-foreground mb-3">
                {reader.nickname}
              </h1>
              <div className="text-sm text-muted-foreground text-center mb-3">
                {reader.bio}
              </div>
              <div className="text-sm text-muted-foreground">
                42 livros lidos
              </div>
            </div>
          ))
        ) : (
          <div>Sem leitoras</div>
        )}
      </div>
    </div>
  );
}
