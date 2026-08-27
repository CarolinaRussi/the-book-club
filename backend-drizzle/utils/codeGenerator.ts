import { eq } from "drizzle-orm";
import { club, readingDraw } from "../db/schema";
import type { db } from "../db/client";

type Db = typeof db;

const sanitizeClubName = (name: string): string => {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .substring(0, 6);
};

const generateRandomSuffix = (length: number = 4): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const generateUniqueInvitationCode = async (
  clubName: string,
  dbClient: Db,
): Promise<string> => {
  const prefix = sanitizeClubName(clubName);
  let isUnique = false;
  let finalCode = "";

  while (!isUnique) {
    const suffix = generateRandomSuffix(3);
    finalCode = `${prefix}-${suffix}`;

    const existing = await dbClient
      .select()
      .from(club)
      .where(eq(club.invitationCode, finalCode))
      .limit(1);

    if (existing.length === 0) {
      isUnique = true;
    }
  }

  return finalCode;
};

export const generateUniqueReadingDrawShareCode = async (
  dbClient: Db,
): Promise<string> => {
  for (;;) {
    const shareCode = generateRandomSuffix(8);
    const existing = await dbClient
      .select({ id: readingDraw.id })
      .from(readingDraw)
      .where(eq(readingDraw.shareCode, shareCode))
      .limit(1);
    if (existing.length === 0) {
      return shareCode;
    }
  }
};
