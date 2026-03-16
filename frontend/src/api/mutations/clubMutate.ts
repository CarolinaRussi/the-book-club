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

export async function deleteClub(id: string): Promise<any> {
  console.log(id);
  return;

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

export async function banMember(
  memberId: string
): Promise<any> {
  if (!memberId) {
    throw { message: "ID do membro é obrigatório." };
  }

  try {
    const response = await api.delete(`/delete-member/${memberId}`);

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw { message: error.response.data.message };
    }
    throw { message: "Erro desconhecido ao banir membro." };
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
