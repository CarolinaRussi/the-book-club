import axios from "axios";
import { api } from "../index";
import type { IRegisterData } from "../../types/IRegister";
import type { IApiReturnData } from "../../types/IApi";
import type { ILoginData } from "../../types/ILogin";
import type {
  IForgotPasswordData,
  IResetPasswordData,
} from "../../types/IPasswordReset";
import type { IUser } from "../../types/IUser";

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

export async function forgotPassword(
  data: IForgotPasswordData,
): Promise<{ message: string }> {
  try {
    const response = await api.post("/auth/forgot-password", data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw { message: error.response.data.message };
    }
    throw { message: "Erro desconhecido" };
  }
}

export async function resetPassword(
  data: IResetPasswordData,
): Promise<{ message: string }> {
  try {
    const response = await api.post("/auth/reset-password", data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw { message: error.response.data.message };
    }
    throw { message: "Erro desconhecido" };
  }
}
