import axios from "axios";
import { api } from "../index";
import type { IClubPayload, IEditClubPayload } from "../../types/IClubs";
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

export async function updateClub(payload: IEditClubPayload): Promise<any> {
  console.log(payload);
  const { id, ...data } = payload;

  if (!id) {
    throw { message: "ID do clube é obrigatório para atualizar." };
  }
  try {
    const response = await api.put(`/update-club/${id}`, data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw { message: error.response.data.message };
    }
    throw { message: "Erro desconhecido" };
  }
}

export async function deleteClub(payload: any): Promise<any> {
  const { id, ...data } = payload;
  console.log(id, data);

  // if (!id) {
  //   throw { message: "ID do encontro é obrigatório para atualizar." };
  // }
  // try {
  //   const response = await api.put(`/update-meeting/${id}`, data);
  //   return response.data;
  // } catch (error: unknown) {
  //   if (axios.isAxiosError(error) && error.response?.data?.message) {
  //     throw { message: error.response.data.message };
  //   }
  //   throw { message: "Erro desconhecido" };
  // }
}

export async function banMember(clubId: any, memberId: any): Promise<any> {
  console.log(clubId, memberId);

  // if (!id) {
  //   throw { message: "ID do encontro é obrigatório para atualizar." };
  // }
  // try {
  //   const response = await api.put(`/update-meeting/${id}`, data);
  //   return response.data;
  // } catch (error: unknown) {
  //   if (axios.isAxiosError(error) && error.response?.data?.message) {
  //     throw { message: error.response.data.message };
  //   }
  //   throw { message: "Erro desconhecido" };
  // }
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
