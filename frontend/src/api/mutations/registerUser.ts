import axios from "axios";
import { api } from "../index";
import { RegisterData } from "../../types/IRegister";

export async function registerUser(
  data: RegisterData
): Promise<{ token: string; id: string; name: string }> {
  try {
    const response = await api.post("/register", data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw { message: error.response.data.message };
    }
    throw { message: "Erro desconhecido" };
  }
}
