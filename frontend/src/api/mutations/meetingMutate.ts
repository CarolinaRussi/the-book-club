import axios from "axios";
import { api } from "../index";
import type {
  IMeetingCreatePayload,
  IMeetingUpdatePayload,
} from "@//types/IMeetings";

export async function createMeeting(data: IMeetingCreatePayload): Promise<any> {
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

export async function updateMeeting(
  payload: IMeetingUpdatePayload
): Promise<any> {
  const { id, ...data } = payload;

  if (!id) {
    throw { message: "ID do encontro é obrigatório para atualizar." };
  }
  try {
    const response = await api.put(`/update-meeting/${id}`, data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw { message: error.response.data.message };
    }
    throw { message: "Erro desconhecido" };
  }
}
