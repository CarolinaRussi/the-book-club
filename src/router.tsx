import { createBrowserRouter } from "react-router";
import { PrivateRoute } from "./components/private/PrivateRoute.tsx";
import { Layout } from "./components/layout/index.tsx";

import Register from "./pages/Register.tsx";
import Meetings from "./pages/Meetings.tsx";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Readers from "./pages/Readers.tsx";
import Library from "./pages/Library.tsx";

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
