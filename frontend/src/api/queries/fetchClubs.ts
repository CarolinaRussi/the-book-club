import type { IClubInvitePreview } from "../../types/IClubs";
import { api } from "../index";

export const fetchClubByInvitationCode = async (
  invitationCode: string | null
): Promise<IClubInvitePreview> => {
  const { data } = await api.get(`/invitation-code/${invitationCode}`);
  return data;
};
