import { user } from "../db/schema";

export function toPublicUser(row: typeof user.$inferSelect) {
  const { password, googleRefreshToken, ...rest } = row;
  return {
    ...rest,
    googleConnected: Boolean(googleRefreshToken),
  };
}
