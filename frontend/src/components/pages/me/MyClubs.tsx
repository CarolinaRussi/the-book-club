import { Badge } from "../../ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { useAuth } from "@//contexts/AuthContext";
import { useEffect, useState } from "react";
import type { IUserClub } from "@//types/IClubs";
import EditMyClubDialog from "./EditMyClubDialog";
import { fetchPaginatedUserClubs } from "@//api/queries/fetchClubs";
import { useQuery } from "@tanstack/react-query";
import Pagination from "../../ui/pagination";
import { CLUB_STATUS_ACTIVE, clubStatusLabels } from "@//utils/constants/clubs";

export default function MyClubs() {
  const { user } = useAuth();
  const [clubsPage, setClubsPage] = useState(1);
  const itemsPerPage = 5;
  const [clubToUpdate, setClubToUpdate] = useState<IUserClub | undefined>(
    undefined
  );
  const [editMyClubOpen, setEditMyClubOpen] = useState(false);

  if (!user) return null;

  const { data: userClubsData, isFetching } = useQuery({
    queryKey: ["userClubs", user.id, clubsPage],
    queryFn: () => fetchPaginatedUserClubs(user.id, clubsPage, itemsPerPage),
    staleTime: 1000 * 60 * 5,
    enabled: !!user,
  });

  const myClubs = userClubsData?.data || [];
  const totalPages = userClubsData?.totalPages || 1;

  const handlePageChange = (page: number) => {
    setClubsPage(page);
    //window.scrollTo({ top: 200, behavior: "smooth" }); //nao sei se eu gosto disso ainda
  };

  useEffect(() => {
    setClubsPage(1);
  }, [user.id]);

  return (
    <div className="flex flex-col w-full mt-0">
      <div className="grid grid-cols-1 gap-10">
        <Card id="card-meus-clubes" className="w-full mt-3 gap-2">
          <CardContent className="flex flex-col gap-4">
            {myClubs.length > 0 ? (
              !isFetching &&
              myClubs.map((club) => (
                <Card
                  key={club.id}
                  className="w-full gap-0 cursor-pointer"
                  onClick={() => {
                    setClubToUpdate(club);
                    setEditMyClubOpen(true);
                  }}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-semibold text-primary">
                      {club.name}
                      <Badge className="ml-2">Admin</Badge>
                    </CardTitle>
                  </CardHeader>
                  {club.description && (
                    <CardContent className="pt-0 pb-2">
                      <p className="text-md text-muted-foreground">
                        {club.description}
                      </p>
                    </CardContent>
                  )}
                  <CardFooter className="flex justify-between text-sm text-muted-foreground">
                    <span>
                      Criado em:{" "}
                      {new Date(club.createdAt).toLocaleDateString()}
                    </span>
                    <Badge
                      variant={
                        club.status === CLUB_STATUS_ACTIVE
                          ? "default"
                          : "secondary"
                      }
                    >
                      {clubStatusLabels[club.status]}
                    </Badge>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground">
                Você ainda não é dono de nenhum clube.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      {myClubs.length > 0 && totalPages > 1 && (
        <div className="mt-8 flex justify-center w-full">
          <Pagination
            currentPage={clubsPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
      <EditMyClubDialog
        openDialog={editMyClubOpen}
        onOpenChange={setEditMyClubOpen}
        club={clubToUpdate}
      />
    </div>
  );
}
