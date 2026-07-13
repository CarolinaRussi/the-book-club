import { Navigate, Outlet } from "react-router";
import { useClub } from "../../contexts/ClubContext";
import BrandLoadingScreen from "../BrandLoadingScreen";

export function ClubGuard() {
  const { clubs, isLoadingClubs } = useClub();

  if (isLoadingClubs) {
    return <BrandLoadingScreen />;
  }

  if (!clubs || clubs.length === 0) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
