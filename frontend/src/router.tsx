import { createBrowserRouter } from "react-router";
import { PrivateRoute } from "./components/private/PrivateRoute.tsx";
import { ClubGuard } from "./components/private/ClubGuard.tsx";
import { ClubAdminGuard } from "./components/private/ClubAdminGuard.tsx";
import { Layout } from "./components/layout/index.tsx";

import Register from "./pages/Register.tsx";
import Meetings from "./pages/Meetings.tsx";
import Home from "./pages/Home.tsx";
import Login from "./pages/Login.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import Readers from "./pages/Readers.tsx";
import Library from "./pages/Library.tsx";
import ManageClub from "./pages/ManageClub.tsx";
import Index from "./pages/Index.tsx";
import { PublicRoute } from "./components/public/PublicRoute.tsx";
import Me from "./pages/Me.tsx";
import Account from "./pages/Account.tsx";
import UserProfile from "./pages/UserProfile.tsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.tsx";
import NotFound from "./pages/NotFound.tsx";
import InviteJoin from "./pages/InviteJoin.tsx";
import Explore from "./pages/Explore.tsx";
import ExploreClub from "./pages/ExploreClub.tsx";
import BookPage from "./pages/BookPage.tsx";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/privacidade", element: <PrivacyPolicy /> },
      { path: "/privacy", element: <PrivacyPolicy /> },
      { path: "/reset-password", element: <ResetPassword /> },
      { path: "/convite/:code", element: <InviteJoin /> },
      {
        element: <PublicRoute />,
        children: [
          { path: "/", element: <Index /> },
          { path: "/login", element: <Login /> },
          { path: "/register", element: <Register /> },
          { path: "/forgot-password", element: <ForgotPassword /> },
        ],
      },
      {
        element: <PrivateRoute />,
        children: [
          {
            path: "/home",
            element: <Home />,
          },
          {
            path: "/explorar",
            element: <Explore />,
          },
          {
            path: "/explorar/:clubId",
            element: <ExploreClub />,
          },
          {
            path: "/me",
            element: <Me />,
          },
          {
            path: "/me/account",
            element: <Account />,
          },
          {
            path: "/users/:userId",
            element: <UserProfile />,
          },
          {
            path: "/books/:bookId",
            element: <BookPage />,
          },
          {
            element: <ClubGuard />,
            children: [
              {
                path: "/meetings",
                element: <Meetings />,
              },
              {
                path: "/library",
                element: <Library />,
              },
              {
                path: "/readers",
                element: <Readers />,
              },
              {
                element: <ClubAdminGuard />,
                children: [
                  {
                    path: "/club/manage",
                    element: <ManageClub />,
                  },
                ],
              },
            ],
          },
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export { router };
