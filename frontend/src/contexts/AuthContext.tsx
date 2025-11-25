import { createContext, useState, useContext, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/index";
import { fetchAuthenticatedUser } from "../api/queries/fetchUser";
import type { IUser } from "../types/IUser";

interface AuthContextType {
  isLoggedIn: boolean;
  user: IUser | null;
  isLoadingUser: boolean;
  login: (token: string, user: IUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const token = localStorage.getItem("token");
if (token) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading: isLoadingUser,
    isError,
  } = useQuery({
    queryKey: ["authenticatedUser"],
    queryFn: fetchAuthenticatedUser,
    enabled: isLoggedIn,
    staleTime: 1000 * 60 * 5,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!isLoadingUser && isLoggedIn && (isError || !user)) {
      console.warn("Token inválido ou expirado. Realizando logout automático.");
      logout();
    }
  }, [isLoadingUser, isLoggedIn, user, isError]);

  const login = (token: string, userPayload: IUser) => {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("token", token);
    queryClient.setQueryData(["authenticatedUser"], userPayload);
    setIsLoggedIn(true);
  };

  const logout = () => {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    queryClient.clear();
  };

  const isAuthenticatedPublic = isLoggedIn && !!user;

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: isAuthenticatedPublic,
        user: user || null,
        isLoadingUser,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
