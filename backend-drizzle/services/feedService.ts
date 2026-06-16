import * as feedRepository from "../repositories/feedRepository";

export async function getMyFeedPaginated(
  viewerUserId: string,
  page: number,
  limit: number
) {
  const skip = (page - 1) * limit;

  const [rows, totalItems] = await Promise.all([
    feedRepository.findFinishedBooksFeedPaginated(viewerUserId, skip, limit),
    feedRepository.countFinishedBooksFeed(viewerUserId),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

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
