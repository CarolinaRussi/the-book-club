import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { useClub } from "../../contexts/ClubContext";

export function ClubAdminGuard() {
  const { user } = useAuth();
  const { clubs, selectedClubId, isLoadingClubs } = useClub();

  if (isLoadingClubs) {
    return null;
  }

  const selectedClub = clubs.find((club) => club.id === selectedClubId);

  if (!user || !selectedClub || selectedClub.ownerId !== user.id) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
