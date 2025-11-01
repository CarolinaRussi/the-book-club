import { createContext, useState, useEffect, useContext } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query"; // Importe useQuery e useQueryClient
import { IUser } from "../types/IUser";
import { api } from "../api/index";
import { fetchAuthenticatedUser } from "../api/queries/fetchUser";

interface AuthContextType {
  isLoggedIn: boolean;
  user: IUser | null;
  isLoadingUser: boolean;
  login: (token: string, user: IUser) => void;
  logout: () => void;
  updateUserContext: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setIsLoggedIn(true);
    }
  }, []);

  const {
    data: user,
    refetch: refetchUser,
    isLoading: isLoadingUser,
  } = useQuery({
    queryKey: ["authenticatedUser"],
    queryFn: fetchAuthenticatedUser,
    enabled: isLoggedIn,
    staleTime: 1000 * 60 * 5,
    retry: 1,
    refetchOnWindowFocus: false,
  });

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

    queryClient.removeQueries({ queryKey: ["authenticatedUser"] });
    queryClient.clear();
  };

  const updateUserContext = () => {
    refetchUser();
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user: user || null,
        isLoadingUser,
        login,
        logout,
        updateUserContext,
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
