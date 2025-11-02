import axios from "axios";
import { api } from "../index";
import { IClubData } from "../../types/IClubs";

export async function createClub(data: IClubData): Promise<any> {
  try {
    const response = await api.post("/create-club", data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw { message: error.response.data.message };
    }
    throw { message: "Erro desconhecido" };
  }
}
