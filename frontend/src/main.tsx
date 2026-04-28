import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { applyClubTheme, getStoredClubTheme } from "./utils/clubTheme";
import App from "./App.tsx";

applyClubTheme(getStoredClubTheme());
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer, Zoom } from "react-toastify";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ToastContainer
        transition={Zoom}
        autoClose={3000}
        closeOnClick
        position="bottom-right"
      />
    </QueryClientProvider>
  </StrictMode>
);
