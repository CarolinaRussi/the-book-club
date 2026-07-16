export const MembershipRequestStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
} as const;

export type MembershipRequestStatusValue =
  (typeof MembershipRequestStatus)[keyof typeof MembershipRequestStatus];
