import axios from "axios";
import { api } from "../index";
import type {
  ICreateReadingDrawPayload,
  IReadingDraw,
} from "@/types/IReadingDraw";

type ReadingDrawResponse = { message: string; readingDraw: IReadingDraw };

function throwApiError(error: unknown, fallback: string): never {
  if (axios.isAxiosError(error) && error.response?.data?.message) {
    throw { message: error.response.data.message };
  }
  throw { message: fallback };
}

export async function createReadingDraw(
  clubId: string,
  payload: ICreateReadingDrawPayload,
): Promise<ReadingDrawResponse> {
  try {
    const response = await api.post(
      `/clubs/${clubId}/reading-draws`,
      payload,
    );
    return response.data;
  } catch (error: unknown) {
    throwApiError(error, "Erro ao criar sorteio.");
  }
}

export async function upsertReadingDrawNomination(
  drawId: string,
  payload: { title: string; author?: string },
): Promise<ReadingDrawResponse> {
  try {
    const response = await api.patch(
      `/reading-draws/${drawId}/nomination`,
      payload,
    );
    return response.data;
  } catch (error: unknown) {
    throwApiError(error, "Erro ao salvar indicação.");
  }
}

export async function confirmReadingDrawNomination(
  drawId: string,
): Promise<ReadingDrawResponse> {
  try {
    const response = await api.post(
      `/reading-draws/${drawId}/nomination/confirm`,
    );
    return response.data;
  } catch (error: unknown) {
    throwApiError(error, "Erro ao confirmar indicação.");
  }
}

export async function unconfirmReadingDrawNomination(
  drawId: string,
): Promise<ReadingDrawResponse> {
  try {
    const response = await api.post(
      `/reading-draws/${drawId}/nomination/unconfirm`,
    );
    return response.data;
  } catch (error: unknown) {
    throwApiError(error, "Erro ao alterar indicação.");
  }
}

export async function revealReadingDraw(
  drawId: string,
): Promise<ReadingDrawResponse> {
  try {
    const response = await api.post(`/reading-draws/${drawId}/reveal`);
    return response.data;
  } catch (error: unknown) {
    throwApiError(error, "Erro ao realizar o sorteio.");
  }
}

export async function eliminateReadingDrawNomination(
  drawId: string,
): Promise<ReadingDrawResponse> {
  try {
    const response = await api.post(`/reading-draws/${drawId}/eliminate`);
    return response.data;
  } catch (error: unknown) {
    throwApiError(error, "Erro ao eliminar indicação.");
  }
}

export async function cancelReadingDraw(
  drawId: string,
): Promise<ReadingDrawResponse> {
  try {
    const response = await api.post(`/reading-draws/${drawId}/cancel`);
    return response.data;
  } catch (error: unknown) {
    throwApiError(error, "Erro ao cancelar o sorteio.");
  }
}

export async function completeReadingDraw(
  drawId: string,
  clubBookId: string,
): Promise<ReadingDrawResponse> {
  try {
    const response = await api.post(`/reading-draws/${drawId}/complete`, {
      clubBookId,
    });
    return response.data;
  } catch (error: unknown) {
    throwApiError(error, "Erro ao concluir o sorteio.");
  }
}
