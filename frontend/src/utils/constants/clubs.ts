export const CLUB_STATUS_VALUES = [
  "active",
  "inactive",
] as const;

export type ClubStatus = (typeof CLUB_STATUS_VALUES)[number];

export const CLUB_STATUS_ACTIVE: ClubStatus = "active";
export const CLUB_STATUS_INACTIVE: ClubStatus = "inactive";

export const clubStatusLabels: Record<ClubStatus, string> = {
  [CLUB_STATUS_ACTIVE]: "Ativo",
  [CLUB_STATUS_INACTIVE]: "Inativo",
};
