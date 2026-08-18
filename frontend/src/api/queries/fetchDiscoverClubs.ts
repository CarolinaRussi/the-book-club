import { api } from "../index";
import type { IDiscoverClub, IDiscoverClubsResponse } from "../../types/IClubs";
import type { MeetingFormat } from "@/utils/constants/clubs";

export type DiscoverMapBbox = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
};

export type DiscoverClubsParams = {
  page?: number;
  limit?: number;
  meetingFormat?: MeetingFormat;
  stateId?: number;
  cityId?: number;
  q?: string;
  bbox?: DiscoverMapBbox;
};

export async function fetchDiscoverClubs(
  params: DiscoverClubsParams = {},
): Promise<IDiscoverClubsResponse> {
  const response = await api.get<IDiscoverClubsResponse>("/clubs/discover", {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 12,
      meetingFormat: params.meetingFormat,
      stateId: params.stateId,
      cityId: params.cityId,
      q: params.q?.trim() || undefined,
      minLat: params.bbox?.minLat,
      maxLat: params.bbox?.maxLat,
      minLng: params.bbox?.minLng,
      maxLng: params.bbox?.maxLng,
    },
  });
  return response.data;
}

export async function fetchPublicClubPreview(
  clubId: string,
): Promise<IDiscoverClub> {
  const response = await api.get<{ club: IDiscoverClub }>(
    `/clubs/${clubId}/public`,
  );
  return response.data.club;
}
