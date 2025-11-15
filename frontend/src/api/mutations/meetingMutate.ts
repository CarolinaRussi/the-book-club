import axios from "axios";
import { api } from "../index";
import type { IMeetingPayload } from "@//types/IMeetings";

export async function createMeeting(data: IMeetingPayload): Promise<any> {
  try {
    const response = await api.post("/create-meeting", data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw { message: error.response.data.message };
    }
    throw { message: "Erro desconhecido" };
  }
}
