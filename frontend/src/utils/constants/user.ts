export const USER_STATUS_VALUES = ["active", "inactive"] as const;

export type UserStatus = (typeof USER_STATUS_VALUES)[number];

export const USER_STATUS_ACTIVE: UserStatus = "active";
export const USER_STATUS_INACTIVE: UserStatus = "inactive";

export const userStatusLabels: Record<UserStatus, string> = {
  [USER_STATUS_ACTIVE]: "Ativo",
  [USER_STATUS_INACTIVE]: "Inativo",
};
