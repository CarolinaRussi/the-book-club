import { UserStatus } from "../enums/userStatus";
import { ReadingStatus } from "../enums/readingStatus";
import * as userRepository from "../repositories/userRepository";
import * as userProfileRepository from "../repositories/userProfileRepository";

export class UserProfileNotFoundError extends Error {
  constructor() {
    super("Usuária não encontrada.");
    this.name = "UserProfileNotFoundError";
  }
}

export class UserProfileForbiddenError extends Error {
  constructor() {
    super("Você só pode ver perfis de pessoas dos seus clubes.");
    this.name = "UserProfileForbiddenError";
  }
}

function toPublicProfileUser(
  row: NonNullable<Awaited<ReturnType<typeof userRepository.findUserById>>>,
) {
  return {
    id: row.id,
    name: row.name,
    nickname: row.nickname,
    profilePicture: row.profilePicture,
    bio: row.bio,
    favoritesGenres: row.favoritesGenres ?? [],
  };
}

async function assertCanViewProfile(viewerUserId: string, targetUserId: string) {
  const targetUser = await userRepository.findUserById(targetUserId);

  if (!targetUser || targetUser.status !== UserStatus.ACTIVE) {
    throw new UserProfileNotFoundError();
  }

  if (viewerUserId === targetUserId) {
    return targetUser;
  }

  const shared = await userProfileRepository.usersShareAtLeastOneClub(
    viewerUserId,
    targetUserId,
  );

  if (!shared) {
    throw new UserProfileForbiddenError();
  }

  return targetUser;
}

export async function getUserProfile(
  viewerUserId: string,
  targetUserId: string,
) {
  const targetUser = await assertCanViewProfile(viewerUserId, targetUserId);

  const finishedBooksCount = await userRepository.countUserBooksByUserId(
    targetUserId,
    ReadingStatus.FINISHED,
  );

  return {
    user: toPublicProfileUser(targetUser),
    stats: { finishedBooksCount },
  };
}

export async function getUserReadingsPaginated(
  viewerUserId: string,
  targetUserId: string,
  page: number,
  limit: number,
  status: ReadingStatus = ReadingStatus.FINISHED,
) {
  await assertCanViewProfile(viewerUserId, targetUserId);

  const skip = (page - 1) * limit;
  const [userBooksData, totalItems] = await Promise.all([
    userRepository.findUserBooksPaginatedForUser(
      targetUserId,
      skip,
      limit,
      status,
    ),
    userRepository.countUserBooksByUserId(targetUserId, status),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  const bookIds = userBooksData
    .map((ub) => ub.book?.id)
    .filter((id): id is string => Boolean(id));

  const reviewRows = await userRepository.findMyReviewsForUserBookIds(
    targetUserId,
    bookIds,
  );

  const reviewByBookId = new Map<
    string,
    { rating: number | null; comment: string | null }
  >();
  for (const row of reviewRows) {
    if (!reviewByBookId.has(row.bookId)) {
      reviewByBookId.set(row.bookId, {
        rating: row.rating,
        comment: row.comment,
      });
    }
  }

  const data = userBooksData.map((ub) => {
    const book = ub.book;
    const mine = book ? reviewByBookId.get(book.id) : undefined;
    return {
      id: ub.id,
      updatedAt: ub.updatedAt,
      readingStatus: ub.readingStatus,
      myRating: mine?.rating ?? null,
      myComment: mine?.comment ?? null,
      book: book
        ? {
            id: book.id,
            title: book.title,
            author: book.author,
            coverUrl: book.coverUrl,
          }
        : null,
    };
  });

  return { data, totalPages, currentPage: page, totalItems };
}
