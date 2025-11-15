import { createContext, useState, useContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchUserClubs } from "../api/queries/fetchUserClubs";
import type { IClub } from "../types/IClubs";
import { useAuth } from "./AuthContext";

interface ClubContextData {
  selectedClubId: string | null;
  setSelectedClubId: (id: string | null) => void;
  clubs: IClub[];
  isLoadingClubs: boolean;
}

const ClubContext = createContext<ClubContextData | undefined>(undefined);

export function ClubProvider({ children }: { children: React.ReactNode }) {
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const { user } = useAuth();

  const { data: clubsData, isLoading: isLoadingClubs } = useQuery({
    queryKey: ["userClubs", user?.id],
    queryFn: fetchUserClubs,
    staleTime: 1000 * 60 * 5,
    enabled: !!user,
  });

  const clubs = clubsData || [];

  useEffect(() => {
    if (!user) {
      setSelectedClubId(null);
    } else if (clubs && clubs.length > 0) {
      const currentSelectionIsValid = clubs.some(
        (club) => club.id === selectedClubId
      );

      if (!selectedClubId || !currentSelectionIsValid) {
        setSelectedClubId(clubs[0].id);
      }
    }
  }, [user, clubs, selectedClubId]);

  const value = {
    selectedClubId,
    setSelectedClubId,
    clubs,
    isLoadingClubs,
  };

  return <ClubContext.Provider value={value}>{children}</ClubContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useClub() {
  const context = useContext(ClubContext);
  if (!context) {
    throw new Error("useClub deve ser usado dentro de ClubProvider");
  }
  return context;
}
