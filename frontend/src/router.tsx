import { createBrowserRouter } from "react-router";
import { PrivateRoute } from "./components/private/PrivateRoute.tsx";
import { Layout } from "./components/layout/index.tsx";

import Register from "./pages/Register.tsx";
import Meetings from "./pages/Meetings.tsx";
import Home from "./pages/Home.tsx";
import Login from "./pages/Login.tsx";
import Readers from "./pages/Readers.tsx";
import Library from "./pages/Library.tsx";
import Index from "./pages/Index.tsx";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Index />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        element: <PrivateRoute />,
        children: [
          {
            path: "/home",
            element: <Home />,
          },
          {
            path: "/meetings",
            element: <Meetings />,
          },
          {
            path: "/readers",
            element: <Readers />,
          },
          {
            path: "/library",
            element: <Library />,
          },
        ],
      },
    ],
  },
]);

export { router };
