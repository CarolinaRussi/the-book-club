import axios from "axios";
import { api } from "../index";
import { IRegisterData } from "../../types/IRegister";
import { IApiReturnData } from "../../types/IApi";
import { ILoginData } from "../../types/ILogin";
import { IUser } from "../../types/IUser";

export async function registerUser(
  data: IRegisterData
): Promise<IApiReturnData> {
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