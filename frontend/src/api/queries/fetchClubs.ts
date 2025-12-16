import type { IPaginatedResponse } from "@//types/IApi";
import type { IClubWithOwner, IUserClub } from "../../types/IClubs";
import { api } from "../index";

export const fetchClubByInvitationCode = async (
  invitationCode: string | null
): Promise<IClubWithOwner> => {
  const { data } = await api.get(`/invitation-code/${invitationCode}`);
  return data;
};

export const fetchPaginatedUserClubs = async (
  userId: string | null,
  page: number = 1,
  itemsPerPage: number = 15
): Promise<IPaginatedResponse<IUserClub>> => {
  const { data } = await api.get(`/user-clubs/${userId}`, {
    params: {
      page,
      limit: itemsPerPage,
    },
  });
  return data;
};