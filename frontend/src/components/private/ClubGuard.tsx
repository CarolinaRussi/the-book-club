import { Navigate, Outlet } from "react-router";
import { useClub } from "../../contexts/ClubContext";

export function ClubGuard() {
  const { clubs, isLoadingClubs } = useClub();

  if (isLoadingClubs) {
    return null;
  }

  if (!clubs || clubs.length === 0) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
