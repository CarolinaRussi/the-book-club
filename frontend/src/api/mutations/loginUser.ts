import axios from "axios";
import { api } from "../index";
import { ILoginData } from "../../types/ILogin";
import { IUser } from "../../types/IApi";

export async function loginUser(
  data: ILoginData
): Promise<{ token: string; user: IUser }> {
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
