import { api } from "../index";
import type { ICity, IState } from "../../types/IClubs";

export async function fetchStates(): Promise<IState[]> {
  const response = await api.get<{ data: IState[] }>("/locations/states");
  return response.data.data;
}

export async function fetchCitiesByStateId(
  stateId: number,
  searchQuery?: string,
): Promise<ICity[]> {
  const response = await api.get<{ data: ICity[] }>(
    `/locations/states/${stateId}/cities`,
    {
      params: searchQuery?.trim() ? { q: searchQuery.trim() } : undefined,
    },
  );
  return response.data.data;
}
