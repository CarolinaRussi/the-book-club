import { useAuth } from "../../contexts/AuthContext";
import { Navigate, Outlet } from "react-router";

export const PublicRoute = () => {
  const { isLoggedIn } = useAuth();

  if (isLoggedIn) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};
