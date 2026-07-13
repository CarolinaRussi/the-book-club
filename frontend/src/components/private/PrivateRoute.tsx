import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import BrandLoadingScreen from "../BrandLoadingScreen";
import { GoogleOAuthReturnHandler } from "../GoogleOAuthReturnHandler";

export const PrivateRoute = () => {
  const { isLoggedIn, isLoadingUser } = useAuth();

  if (isLoadingUser) {
    return <BrandLoadingScreen />;
  }

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <GoogleOAuthReturnHandler />
      <Outlet />
    </>
  );
};
