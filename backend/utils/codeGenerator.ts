import { PrismaClient } from "../generated/prisma/client";

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
  db: PrismaClient
): Promise<string> => {
  const prefix = sanitizeClubName(clubName);
  let isUnique = false;
  let finalCode = "";

  while (!isUnique) {
    const suffix = generateRandomSuffix(3);
    finalCode = `${prefix}-${suffix}`;

    const existingClub = await db.club.findUnique({
      where: {
        invitation_code: finalCode,
      },
    });

    if (!existingClub) {
      isUnique = true;
    }
  }

  return finalCode;
};