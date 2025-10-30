import { createContext, useState, useContext, useEffect } from "react";
import { api } from "../api";
import { useQuery } from "@tanstack/react-query";
import { fetchUserClubs } from "../api/queries/fetchUserClubs";
import { UserClub } from "../types/IClubs";

interface ClubContextData {
  selectedClubId: string | null;
  setSelectedClubId: (id: string | null) => void;
  userClubs: UserClub[];
  isLoadingClubs: boolean;
}

const ClubContext = createContext<ClubContextData | undefined>(undefined);

export function ClubProvider({ children }: { children: React.ReactNode }) {
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);

  const { data: userClubs, isLoading: isLoadingClubs } = useQuery({
    queryKey: ["userClubs"],
    queryFn: fetchUserClubs,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (userClubs && userClubs.length > 0 && !selectedClubId) {
      setSelectedClubId(userClubs[0].id);
    }
  }, [userClubs, selectedClubId]);

  const value = {
    selectedClubId,
    setSelectedClubId,
    userClubs: userClubs || [],
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
