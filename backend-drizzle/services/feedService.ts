import * as feedRepository from "../repositories/feedRepository";
import * as clubRepository from "../repositories/clubRepository";

type FeedSortKey = {
  id: string;
  type: "finished" | "meeting_recap";
  sortAt: Date | string;
};

function sortAtTime(value: Date | string) {
  return value instanceof Date ? value.getTime() : new Date(value).getTime();
}

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

  const [finishedKeys, recapKeys] = await Promise.all([
    feedRepository.findFinishedFeedSortKeys(viewerUserId),
    feedRepository.findMeetingRecapFeedSortKeys(viewerUserId),
  ]);

  const mergedKeys: FeedSortKey[] = [
    ...finishedKeys.map((key) => ({
      id: key.id,
      type: "finished" as const,
      sortAt: key.sortAt,
    })),
    ...recapKeys.map((key) => ({
      id: key.id,
      type: "meeting_recap" as const,
      sortAt: key.sortAt,
    })),
  ].sort((left, right) => sortAtTime(right.sortAt) - sortAtTime(left.sortAt));

  const totalItems = mergedKeys.length;
  const totalPages = Math.ceil(totalItems / limit) || 0;
  const skip = (page - 1) * limit;
  const pageKeys = mergedKeys.slice(skip, skip + limit);

  const finishedIds = pageKeys
    .filter((key) => key.type === "finished")
    .map((key) => key.id);
  const recapIds = pageKeys
    .filter((key) => key.type === "meeting_recap")
    .map((key) => key.id);

  const [finishedRows, recapRows] = await Promise.all([
    feedRepository.findFinishedBooksFeedByIds(viewerUserId, finishedIds),
    feedRepository.findMeetingRecapsFeedByIds(viewerUserId, recapIds),
  ]);

  const bookIds = [...new Set(finishedRows.map((row) => row.bookId))];
  const clubLinks = await feedRepository.findViewerClubsForBookIds(
    viewerUserId,
    bookIds
  );

  const clubsByBookId = new Map<string, { id: string; name: string }[]>();
  for (const link of clubLinks) {
    const list = clubsByBookId.get(link.bookId) ?? [];
    if (!list.some((clubRow) => clubRow.id === link.clubId)) {
      list.push({ id: link.clubId, name: link.clubName });
    }
    clubsByBookId.set(link.bookId, list);
  }

  const finishedById = new Map(
    finishedRows.map((row) => [
      row.userBookId,
      {
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
      },
    ])
  );

  const recapById = new Map(
    recapRows.map((row) => [
      row.recapId,
      {
        id: row.recapId,
        type: "meeting_recap" as const,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        actor: {
          id: row.actorId,
          name: row.actorName,
          nickname: row.actorNickname,
          profilePicture: row.actorProfilePicture,
        },
        isOwnActivity: row.actorId === viewerUserId,
        club: {
          id: row.clubId,
          name: row.clubName,
        },
        meeting: {
          id: row.meetingId,
          meetingDate: row.meetingDate,
          meetingTime: row.meetingTime,
          location: row.meetingLocation,
        },
        book: row.bookId
          ? {
              id: row.bookId,
              title: row.bookTitle,
              author: row.bookAuthor,
              coverUrl: row.bookCoverUrl,
            }
          : null,
        text: row.text,
        imageUrl: row.imageUrl,
      },
    ])
  );

  const data = pageKeys
    .map((key) =>
      key.type === "finished"
        ? finishedById.get(key.id)
        : recapById.get(key.id)
    )
    .filter((item): item is NonNullable<typeof item> => item != null);

  return {
    data,
    totalPages,
    currentPage: page,
    totalItems,
  };
}
