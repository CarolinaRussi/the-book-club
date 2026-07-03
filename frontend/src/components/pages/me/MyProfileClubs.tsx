import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useClub } from "@/contexts/ClubContext";
import { fetchPaginatedUserClubs } from "@/api/queries/fetchClubs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EditMyClubDialog from "@/components/pages/me/EditMyClubDialog";
import type { IClub, IUserClub } from "@/types/IClubs";
import { cn } from "@/lib/utils";

export default function MyProfileClubs() {
  const { user } = useAuth();
  const { clubs, isLoadingClubs } = useClub();
  const [clubToEdit, setClubToEdit] = useState<IUserClub | undefined>();
  const [editOpen, setEditOpen] = useState(false);

  const { data: ownedClubsData } = useQuery({
    queryKey: ["userClubs", user?.id, "owned-for-edit"],
    queryFn: () => fetchPaginatedUserClubs(user!.id, 1, 50),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const ownedClubsById = useMemo(() => {
    const map = new Map<string, IUserClub>();
    for (const club of ownedClubsData?.data ?? []) {
      map.set(club.id, club);
    }
    return map;
  }, [ownedClubsData]);

  if (!user) return null;

  if (isLoadingClubs) {
    return (
      <p className="py-6 text-center text-muted-foreground">
        Carregando clubes...
      </p>
    );
  }

  if (clubs.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">
        Você ainda não participa de nenhum clube.
      </p>
    );
  }

  const handleClubClick = (club: IClub) => {
    const owned = ownedClubsById.get(club.id);
    if (!owned) return;
    setClubToEdit(owned);
    setEditOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {clubs.map((club) => {
          const isAdmin = club.ownerId === user.id;
          return (
            <Card
              key={club.id}
              className={cn(
                "gap-2 transition-shadow",
                isAdmin && "cursor-pointer hover:shadow-md",
              )}
              onClick={() => handleClubClick(club)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex flex-wrap items-center gap-2 text-lg text-primary">
                  <span>{club.name}</span>
                  {isAdmin ? <Badge>Admin</Badge> : null}
                </CardTitle>
              </CardHeader>
              {club.description ? (
                <CardContent className="pt-0">
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {club.description}
                  </p>
                </CardContent>
              ) : null}
              {isAdmin ? (
                <CardContent className="pt-0 pb-4">
                  <p className="text-xs text-muted-foreground">
                    Clique para gerenciar
                  </p>
                </CardContent>
              ) : null}
            </Card>
          );
        })}
      </div>

      <EditMyClubDialog
        club={clubToEdit}
        openDialog={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setClubToEdit(undefined);
        }}
      />
    </>
  );
}
