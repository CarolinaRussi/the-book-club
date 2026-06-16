import * as feedRepository from "../repositories/feedRepository";
import * as clubRepository from "../repositories/clubRepository";

export async function getMyFeedPaginated(
  viewerUserId: string,
  page: number,
  limit: number
) {
  const clubIds = await clubRepository.findClubIdsByUserId(viewerUserId);
  if (clubIds.length === 0) {
    return {
      data: [],
      totalPages: 0,
      currentPage: page,
      totalItems: 0,
    };
  }

  const skip = (page - 1) * limit;

  const [rows, totalItems] = await Promise.all([
    feedRepository.findFinishedBooksFeedPaginated(viewerUserId, skip, limit),
    feedRepository.countFinishedBooksFeed(viewerUserId),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  const bookIds = [...new Set(rows.map((row) => row.bookId))];
  const clubLinks = await feedRepository.findViewerClubsForBookIds(
    viewerUserId,
    bookIds
  );

  const clubsByBookId = new Map<string, { id: string; name: string }[]>();
  for (const link of clubLinks) {
    const list = clubsByBookId.get(link.bookId) ?? [];
    if (!list.some((club) => club.id === link.clubId)) {
      list.push({ id: link.clubId, name: link.clubName });
    }
    clubsByBookId.set(link.bookId, list);
  }

  const data = rows.map((row) => ({
    id: row.userBookId,
    type: "finished" as const,
    updatedAt: row.updatedAt,
    actor: {
      id: row.actorId,
      name: row.actorName,
      nickname: row.actorNickname,
      profilePicture: row.actorProfilePicture,
    },
    isOwnActivity: row.actorId === viewerUserId,
    book: {
      id: row.bookId,
      title: row.bookTitle,
      author: row.bookAuthor,
      coverUrl: row.bookCoverUrl,
    },
    clubs: clubsByBookId.get(row.bookId) ?? [],
    readingStatus: row.readingStatus,
    rating: row.rating,
    comment: row.comment,
  }));

  return {
    data,
    totalPages,
    currentPage: page,
    totalItems,
  };
}
