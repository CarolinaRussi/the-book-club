import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import SkeletonHome from "./SkeletonHome";
import { GoogleOAuthReturnHandler } from "../GoogleOAuthReturnHandler";

export const PrivateRoute = () => {
  const { isLoggedIn, isLoadingUser } = useAuth();

  if (isLoadingUser) {
    return <SkeletonHome />;
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
