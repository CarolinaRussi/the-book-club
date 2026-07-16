import axios from "axios";
import { api } from "../index";
import type { IUser } from "@/types/IUser";

type UpdatePersonalListPayload = {
  bookId: string;
  userId: string;
};

export async function updateUser(
  data: FormData,
): Promise<{ message: string; user: IUser }> {
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

export async function updateUserPersonalList(
  payload: UpdatePersonalListPayload,
): Promise<{ action: string }> {
  try {
    const response = await api.post("/update-personal-library", payload);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw { message: error.response.data.message };
    }
    throw { message: "Erro desconhecido" };
  }
}
