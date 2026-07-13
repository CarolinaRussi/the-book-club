import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { useAuth } from "../contexts/AuthContext";
import { useClub } from "../contexts/ClubContext";
import { fetchReadersByClubId } from "../api/queries/fetchReaders";
import { leaveClub, removeMember } from "../api/mutations/clubMutate";
import { formatDayMonthYear, getInitials } from "../utils/formatters";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import SkeletonReaders from "../components/pages/readers/Skeleton";
import RemoveMemberButton from "../components/pages/readers/RemoveMemberButton";
import LeaveClubButton from "../components/pages/readers/LeaveClubButton";
import { useEffect, useState } from "react";
import Pagination from "../components/ui/pagination";
import { toast } from "react-toastify";
import type { IApiError } from "../types/IApi";

export default function Readers() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { clubs, selectedClubId } = useClub();
  const [readersPage, setReadersPage] = useState(1);
  const itemsPerPage = 8;

  const selectedClub = clubs.find((club) => club.id === selectedClubId);
  const isAdminOfSelectedClub = !!(
    user &&
    selectedClub &&
    selectedClub.ownerId === user.id
  );

  const handlePageChange = (page: number) => {
    setReadersPage(page);
  };

  const { data: readersData, isFetching } = useQuery({
    queryKey: ["readers", selectedClubId, readersPage],
    queryFn: () =>
      fetchReadersByClubId(selectedClubId, readersPage, itemsPerPage),
    staleTime: 1000 * 60 * 5,
    enabled: !!selectedClubId,
  });

  useEffect(() => {
    setReadersPage(1);
  }, [selectedClubId]);

  const { mutate: removeMemberMutate, isPending: isRemovingMember } =
    useMutation<unknown, IApiError, string>({
      mutationFn: removeMember,
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ["readers", selectedClubId],
        });
        toast.success("Membro removido do clube.");
      },
      onError: (error) => {
        toast.error(error.message || "Erro ao remover membro.");
      },
    });

  const { mutate: leaveClubMutate, isPending: isLeavingClub } = useMutation<
    unknown,
    IApiError,
    string
  >({
    mutationFn: leaveClub,
    onSuccess: async () => {
      toast.success("Você saiu do clube.");
      await queryClient.invalidateQueries({ queryKey: ["userClubs"] });
      await queryClient.invalidateQueries({
        queryKey: ["readers", selectedClubId],
      });
      navigate("/home");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao sair do clube.");
    },
  });

  const readers = readersData?.data || [];
  const totalPages = readersData?.totalPages || 1;

  const handleOpenProfile = (readerUserId: string) => {
    if (user?.id === readerUserId) {
      navigate("/me");
      return;
    }
    navigate(`/users/${readerUserId}`);
  };

  return (
    <div className="flex flex-col w-full max-w-7xl p-5 md:p-20">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col items-start">
          <h1 className="text-4xl font-bold text-foreground ">
            Leitores do Clube
          </h1>
          <h2 className="text-md mt-3 w-full text-warm-brown">
            Conheça os leitores apaixonados que fazem parte do nosso clube!
          </h2>
        </div>
        {selectedClub && !isAdminOfSelectedClub ? (
          <LeaveClubButton
            clubName={selectedClub.name}
            disabled={isLeavingClub}
            onConfirm={() => leaveClubMutate(selectedClub.id)}
          />
        ) : null}
      </div>
      {isFetching ? (
        <SkeletonReaders />
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {selectedClubId && readers && readers.length > 0 ? (
              readers.map((reader) => {
                const canRemoveMember =
                  isAdminOfSelectedClub &&
                  selectedClub &&
                  reader.user.id !== selectedClub.ownerId &&
                  reader.user.id !== user?.id;

                return (
                  <div
                    key={reader.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleOpenProfile(reader.user.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleOpenProfile(reader.user.id);
                      }
                    }}
                    className="relative flex flex-col items-center border border-secondary rounded-lg p-8 bg-background shadow-md cursor-pointer transition-shadow hover:shadow-lg"
                  >
                    {canRemoveMember ? (
                      <RemoveMemberButton
                        memberName={
                          reader.user.nickname || reader.user.name
                        }
                        disabled={isRemovingMember}
                        onConfirm={() => removeMemberMutate(reader.id)}
                      />
                    ) : null}
                    <Avatar className="mb-4 size-30 ">
                      <AvatarImage
                        src={reader.user.profilePicture}
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
                    <div className="text-sm text-muted-foreground text-center mt-auto">
                      Membro desde: <p>{formatDayMonthYear(reader.joinedAt)}</p>
                    </div>
                  </div>
                );
              })
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
          {readers.length > 0 && totalPages > 1 && (
            <div className="mt-8 flex justify-center w-full">
              <Pagination
                currentPage={readersPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
