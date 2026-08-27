import type { IReadingDraw } from "@/types/IReadingDraw";
import { api } from "../index";

export async function fetchReadingDrawByShareCode(
  shareCode: string,
): Promise<{ readingDraw: IReadingDraw }> {
  const { data } = await api.get(`/reading-draws/by-code/${shareCode}`);
  return data;
}

export async function fetchActiveReadingDraw(
  clubId: string,
): Promise<{ readingDraw: IReadingDraw | null }> {
  const { data } = await api.get(`/clubs/${clubId}/reading-draws/active`);
  return data;
}
