import axios from "axios";
import { api } from "../index";
import type {
  ICreateReadingDrawPayload,
  IReadingDraw,
} from "@/types/IReadingDraw";

export async function createReadingDraw(
  clubId: string,
  payload: ICreateReadingDrawPayload,
): Promise<{ message: string; readingDraw: IReadingDraw }> {
  try {
    const response = await api.post(
      `/clubs/${clubId}/reading-draws`,
      payload,
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw { message: error.response.data.message };
    }
    throw { message: "Erro ao criar sorteio." };
  }
}
