import { api } from "../index";
import type { IJoinRequest } from "../../types/IClubs";

export async function fetchJoinRequests(
  clubId: string,
): Promise<IJoinRequest[]> {
  const response = await api.get<{ data: IJoinRequest[] }>(
    `/clubs/${clubId}/join-requests`,
  );
  return response.data.data;
}
