import { RouterProvider } from "react-router";
import { AuthProvider } from "./contexts/AuthContext";
import { router } from "./router";
import { ClubProvider } from "./contexts/ClubContext";
import { BookProvider } from "./contexts/BookContext";

function App() {
  return (
    <AuthProvider>
      <ClubProvider>
        <BookProvider>
          <RouterProvider router={router} />
        </BookProvider>
      </ClubProvider>
    </AuthProvider>
  );
}

export default App;
