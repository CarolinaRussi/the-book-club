import * as clubRepository from "./clubRepository";

export async function usersShareAtLeastOneClub(
  viewerUserId: string,
  targetUserId: string,
): Promise<boolean> {
  const [viewerClubIds, targetClubIds] = await Promise.all([
    clubRepository.findClubIdsByUserId(viewerUserId),
    clubRepository.findClubIdsByUserId(targetUserId),
  ]);

  if (viewerClubIds.length === 0 || targetClubIds.length === 0) {
    return false;
  }

  const targetSet = new Set(targetClubIds);
  return viewerClubIds.some((clubId) => targetSet.has(clubId));
}
