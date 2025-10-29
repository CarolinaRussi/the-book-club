import axios from "axios";
import { api } from "../index";
import { LoginData } from "../../types/ILogin";

export async function loginUser(
  data: LoginData
): Promise<{ token: string; id: string; name: string }> {
  try {
    const response = await api.post("/login", data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw { message: error.response.data.message };
    }
    throw { message: "Erro desconhecido" };
  }
}
