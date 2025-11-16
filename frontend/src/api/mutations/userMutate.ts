import axios from "axios";
import { api } from "../index";

export async function updateUser(data: FormData): Promise<any> {
  try {
    const response = await api.put("/update-user", data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw { message: error.response.data.message };
    }
    throw { message: "Erro desconhecido" };
  }
}
