import axios from "axios";
import { api } from "./index";

export type GoogleOAuthStatus = {
  googleConnected: boolean;
  googleAccountEmail: string | null;
};

export async function postGoogleOAuthStart(): Promise<{ redirectUrl: string }> {
  try {
    const { data } = await api.post<{ message?: string; redirectUrl: string }>(
      "/api/auth/google/start",
    );
    return { redirectUrl: data.redirectUrl };
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw { message: error.response.data.message as string };
    }
    throw { message: "Não foi possível iniciar a ligação com o Google." };
  }
}

export async function fetchGoogleOAuthStatus(): Promise<GoogleOAuthStatus> {
  try {
    const { data } = await api.get<GoogleOAuthStatus>("/api/auth/google/status");
    return data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw { message: error.response.data.message as string };
    }
    throw { message: "Não foi possível obter o estado do Google Calendar." };
  }
}

export async function deleteGoogleOAuthDisconnect(): Promise<void> {
  try {
    await api.delete("/api/auth/google");
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw { message: error.response.data.message as string };
    }
    throw { message: "Não foi possível desligar o Google Calendar." };
  }
}
