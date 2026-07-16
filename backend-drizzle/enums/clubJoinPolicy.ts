export const ClubJoinPolicy = {
  OPEN: "open",
  APPROVAL: "approval",
} as const;

export type ClubJoinPolicyValue =
  (typeof ClubJoinPolicy)[keyof typeof ClubJoinPolicy];
