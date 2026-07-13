import axios from "axios";
import { api } from "../index";
import type {
  ICreateFeedbackData,
  ICreateFeedbackResponse,
} from "../../types/IFeedback";

export async function createFeedback(
  data: ICreateFeedbackData,
): Promise<ICreateFeedbackResponse> {
  try {
    const response = await api.post("/feedback", data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw { message: error.response.data.message };
    }
    throw { message: "Erro desconhecido" };
  }
}
