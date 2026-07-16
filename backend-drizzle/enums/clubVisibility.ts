export const ClubVisibility = {
  PRIVATE: "private",
  PUBLIC: "public",
} as const;

export type ClubVisibilityValue =
  (typeof ClubVisibility)[keyof typeof ClubVisibility];
