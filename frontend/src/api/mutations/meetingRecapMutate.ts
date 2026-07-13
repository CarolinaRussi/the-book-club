import axios from "axios";
import { api } from "../index";
import type { IMeetingRecap } from "@/types/IMeetings";

function throwApiError(error: unknown, fallback: string): never {
  if (axios.isAxiosError(error) && error.response?.data?.message) {
    throw { message: error.response.data.message };
  }
  throw { message: fallback };
}

export async function createMeetingRecap(input: {
  meetingId: string;
  text?: string;
  image?: File | null;
}): Promise<{ message: string; recap: IMeetingRecap }> {
  const formData = new FormData();
  if (input.text !== undefined) {
    formData.append("text", input.text);
  }
  if (input.image) {
    formData.append("image", input.image);
  }
  try {
    const response = await api.post(`/meetings/${input.meetingId}/recap`, formData);
    return response.data;
  } catch (error: unknown) {
    throwApiError(error, "Erro ao criar registro do encontro.");
  }
}

export async function updateMeetingRecap(input: {
  meetingId: string;
  text?: string;
  image?: File | null;
  removeImage?: boolean;
}): Promise<{ message: string; recap: IMeetingRecap }> {
  const formData = new FormData();
  if (input.text !== undefined) {
    formData.append("text", input.text);
  }
  if (input.image) {
    formData.append("image", input.image);
  }
  if (input.removeImage) {
    formData.append("removeImage", "true");
  }
  try {
    const response = await api.put(`/meetings/${input.meetingId}/recap`, formData);
    return response.data;
  } catch (error: unknown) {
    throwApiError(error, "Erro ao atualizar registro do encontro.");
  }
}

export async function deleteMeetingRecap(
  meetingId: string,
): Promise<{ message: string }> {
  try {
    const response = await api.delete(`/meetings/${meetingId}/recap`);
    return response.data;
  } catch (error: unknown) {
    throwApiError(error, "Erro ao remover registro do encontro.");
  }
}

export async function dismissMeetingRecapPrompt(
  meetingId: string,
): Promise<{ message: string }> {
  try {
    const response = await api.post(`/meetings/${meetingId}/recap/dismiss`);
    return response.data;
  } catch (error: unknown) {
    throwApiError(error, "Erro ao dispensar lembrete de registro.");
  }
}
