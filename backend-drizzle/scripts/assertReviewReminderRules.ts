import assert from "node:assert/strict";
import { BookStatus } from "../enums/bookStatus";
import { ClubStatus } from "../enums/clubStatus";
import { UserStatus } from "../enums/userStatus";
import {
  groupPendingReviewReminderRows,
  isEligibleReviewReminder,
  REVIEW_REMINDER_LOOKBACK_MONTHS,
  type PendingReviewReminderRow,
} from "../services/reviewReminderDigest";

const now = new Date("2026-08-24T13:00:00.000Z");
const joinedAt = new Date("2026-01-01T00:00:00.000Z");
const finishedRecently = new Date("2026-07-01T00:00:00.000Z");

const base = {
  clubBookStatus: BookStatus.FINISHED,
  deletedAt: null,
  finishedAt: finishedRecently,
  joinedAt,
  userStatus: UserStatus.ACTIVE,
  clubStatus: ClubStatus.ACTIVE,
  rating: null,
  now,
};

assert.equal(isEligibleReviewReminder(base), true);
assert.equal(
  isEligibleReviewReminder({ ...base, rating: 4 }),
  false,
  "nota existente tira da lista",
);
assert.equal(
  isEligibleReviewReminder({ ...base, rating: 0 }),
  false,
  "nota 0 conta como avaliado",
);
assert.equal(
  isEligibleReviewReminder({ ...base, clubBookStatus: BookStatus.STARTED }),
  false,
);
assert.equal(
  isEligibleReviewReminder({ ...base, deletedAt: now }),
  false,
);
assert.equal(
  isEligibleReviewReminder({ ...base, userStatus: UserStatus.INACTIVE }),
  false,
);
assert.equal(
  isEligibleReviewReminder({ ...base, clubStatus: ClubStatus.INACTIVE }),
  false,
);
assert.equal(
  isEligibleReviewReminder({ ...base, finishedAt: null }),
  false,
);

const finishedBeforeJoin = new Date("2025-12-01T00:00:00.000Z");
assert.equal(
  isEligibleReviewReminder({ ...base, finishedAt: finishedBeforeJoin }),
  false,
  "só depois de joinedAt",
);

const finishedTooOld = new Date(now);
finishedTooOld.setMonth(
  finishedTooOld.getMonth() - REVIEW_REMINDER_LOOKBACK_MONTHS - 1,
);
assert.equal(
  isEligibleReviewReminder({ ...base, finishedAt: finishedTooOld }),
  false,
  "fora da janela de 6 meses",
);

const rows: PendingReviewReminderRow[] = [
  {
    userId: "user-1",
    userName: "Ana",
    userEmail: "ana@example.com",
    clubId: "club-a",
    clubName: "Clube A",
    bookId: "book-1",
    bookTitle: "Livro 1",
  },
  {
    userId: "user-1",
    userName: "Ana",
    userEmail: "ana@example.com",
    clubId: "club-a",
    clubName: "Clube A",
    bookId: "book-2",
    bookTitle: "Livro 2",
  },
  {
    userId: "user-1",
    userName: "Ana",
    userEmail: "ana@example.com",
    clubId: "club-b",
    clubName: "Clube B",
    bookId: "book-3",
    bookTitle: "Livro 3",
  },
  {
    userId: "user-2",
    userName: "Bia",
    userEmail: "bia@example.com",
    clubId: "club-a",
    clubName: "Clube A",
    bookId: "book-1",
    bookTitle: "Livro 1",
  },
];

const digests = groupPendingReviewReminderRows(rows);
assert.equal(digests.length, 2);
assert.equal(digests[0]?.userEmail, "ana@example.com");
assert.equal(digests[0]?.clubs.length, 2);
assert.equal(digests[0]?.clubs[0]?.books.length, 2);
assert.equal(digests[0]?.clubs[1]?.clubName, "Clube B");
assert.equal(digests[1]?.userId, "user-2");
assert.equal(digests[1]?.clubs[0]?.books[0]?.bookId, "book-1");

console.log("assertReviewReminderRules: ok");
