import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../contexts/AuthContext";

export const PrivateRoute = () => {
  const { isLoggedIn, isLoadingUser } = useAuth();

  if (isLoadingUser) {
    return <div>Carregando sua sessão...</div>;
  }

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
