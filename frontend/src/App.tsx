import { RouterProvider } from "react-router";
import { AuthProvider } from "./contexts/AuthContext";
import { router } from "./router";
import { ClubProvider } from "./contexts/ClubContext";

function App() {
  return (
    <AuthProvider>
      <ClubProvider>
        <RouterProvider router={router} />
      </ClubProvider>
    </AuthProvider>
  );
}

export default App;
