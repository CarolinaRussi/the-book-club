import axios from "axios";
import { api } from "../index";
import type { IClubPayload } from "../../types/IClubs";
import type { IMembersPayload } from "../../types/IMember";

export async function createClub(data: IClubPayload): Promise<any> {
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

export async function joinClub(data: IMembersPayload): Promise<any> {
  try {
    const response = await api.post("/join-club", data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw { message: error.response.data.message };
    }
    throw { message: "Erro desconhecido" };
  }
}
