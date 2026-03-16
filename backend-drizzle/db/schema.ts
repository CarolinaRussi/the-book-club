import {
  pgTable,
  varchar,
  text,
  timestamp,
  date,
  time,
  integer,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums (PostgreSQL enum types)
export const statusEnum = pgEnum("StatusEnum", ["active", "inactive"]);
export const readingStatusEnum = pgEnum("ReadingStatusEnum", [
  "want_to_read",
  "not_started",
  "dropped",
  "started",
  "finished",
]);
export const bookStatusEnum = pgEnum("BookStatusEnum", [
  "suggested",
  "started",
  "dropped",
  "finished",
]);
export const meetingStatusEnum = pgEnum("MeetingStatusEnum", [
  "scheduled",
  "completed",
  "cancelled",
]);
export const confirmationStatusEnum = pgEnum("ConfirmationStatusEnum", [
  "going",
  "not_going",
  "maybe",
]);

// Book
export const book = pgTable("Book", {
  id: varchar("id", { length: 255 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  author: varchar("author", { length: 255 }),
  coverUrl: varchar("cover_url", { length: 255 }),
  openLibraryId: varchar("open_library_id", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 })
    .defaultNow()
    .notNull(),
  coverPublicId: varchar("cover_public_id", { length: 255 }),
});

// User
export const user = pgTable("User", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  profilePicture: varchar("profile_picture", { length: 255 }),
  favoritesGenres: text("favorites_genres").array(),
  bio: text("bio"),
  status: statusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 })
    .defaultNow()
    .notNull(),
  nickname: varchar("nickname", { length: 255 }).notNull(),
  profilePicturePublicId: varchar("profile_picture_public_id", { length: 255 }),
});

// Club
export const club = pgTable(
  "Club",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    invitationCode: varchar("invitation_code", { length: 255 }).notNull(),
    ownerId: varchar("owner_id", { length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    status: statusEnum("status").default("active").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, precision: 6 })
      .defaultNow()
      .notNull(),
    description: text("description").notNull(),
  },
  (table) => [
    uniqueIndex("Club_invitation_code_key").on(table.invitationCode),
  ]
);

// Meeting
export const meeting = pgTable("Meeting", {
  id: varchar("id", { length: 255 }).primaryKey(),
  clubId: varchar("club_id", { length: 255 })
    .notNull()
    .references(() => club.id, { onDelete: "cascade" }),
  location: varchar("location", { length: 255 }).notNull(),
  meetingDate: date("meeting_date").notNull(),
  meetingTime: time("meeting_time").notNull(),
  description: text("description"),
  status: meetingStatusEnum("status").default("scheduled").notNull(),
  bookId: varchar("book_id", { length: 255 })
    .notNull()
    .references(() => book.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 })
    .defaultNow()
    .notNull(),
});

// Member
export const member = pgTable("Member", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  clubId: varchar("club_id", { length: 255 })
    .notNull()
    .references(() => club.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at", { withTimezone: true, precision: 6 })
    .defaultNow()
    .notNull(),
});

// Review
export const review = pgTable("Review", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  bookId: varchar("book_id", { length: 255 })
    .notNull()
    .references(() => book.id, { onDelete: "cascade" }),
  rating: integer("rating"),
  comment: text("comment"),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 })
    .defaultNow()
    .notNull(),
});

// UserBook
export const userBook = pgTable(
  "UserBook",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    bookId: varchar("book_id", { length: 255 })
      .notNull()
      .references(() => book.id, { onDelete: "cascade" }),
    readingStatus: readingStatusEnum("reading_status")
      .default("want_to_read")
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, precision: 3 })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, precision: 3 })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("UserBook_user_id_book_id_key").on(
      table.userId,
      table.bookId
    ),
  ]
);

// ClubBook
export const clubBook = pgTable(
  "ClubBook",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    clubId: varchar("club_id", { length: 255 })
      .notNull()
      .references(() => club.id, { onDelete: "cascade" }),
    bookId: varchar("book_id", { length: 255 })
      .notNull()
      .references(() => book.id, { onDelete: "cascade" }),
    status: bookStatusEnum("status").default("suggested").notNull(),
    addedAt: timestamp("added_at", { withTimezone: true, precision: 3 })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("ClubBook_club_id_book_id_key").on(table.clubId, table.bookId),
  ]
);

// MeetingConfirmation
export const meetingConfirmation = pgTable(
  "MeetingConfirmation",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    meetingId: varchar("meeting_id", { length: 255 })
      .notNull()
      .references(() => meeting.id, { onDelete: "cascade" }),
    memberId: varchar("member_id", { length: 255 })
      .notNull()
      .references(() => member.id, { onDelete: "cascade" }),
    status: confirmationStatusEnum("status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, precision: 3 })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("MeetingConfirmation_meeting_id_member_id_key").on(
      table.meetingId,
      table.memberId
    ),
  ]
);

// Relations (for query API - optional, used with db.query)
export const bookRelations = relations(book, ({ many }) => ({
  clubBooks: many(clubBook),
  userBooks: many(userBook),
  reviews: many(review),
}));

export const userRelations = relations(user, ({ many }) => ({
  clubs: many(club),
  members: many(member),
  userBooks: many(userBook),
  reviews: many(review),
}));

export const clubRelations = relations(club, ({ one, many }) => ({
  owner: one(user, {
    fields: [club.ownerId],
    references: [user.id],
  }),
  meetings: many(meeting),
  members: many(member),
  clubBooks: many(clubBook),
}));

export const meetingRelations = relations(meeting, ({ one, many }) => ({
  book: one(book, {
    fields: [meeting.bookId],
    references: [book.id],
  }),
  club: one(club, {
    fields: [meeting.clubId],
    references: [club.id],
  }),
  confirmations: many(meetingConfirmation),
}));

export const memberRelations = relations(member, ({ one, many }) => ({
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
  club: one(club, {
    fields: [member.clubId],
    references: [club.id],
  }),
  confirmations: many(meetingConfirmation),
}));

export const reviewRelations = relations(review, ({ one }) => ({
  user: one(user, {
    fields: [review.userId],
    references: [user.id],
  }),
  book: one(book, {
    fields: [review.bookId],
    references: [book.id],
  }),
}));

export const userBookRelations = relations(userBook, ({ one }) => ({
  user: one(user, {
    fields: [userBook.userId],
    references: [user.id],
  }),
  book: one(book, {
    fields: [userBook.bookId],
    references: [book.id],
  }),
}));

export const clubBookRelations = relations(clubBook, ({ one }) => ({
  club: one(club, {
    fields: [clubBook.clubId],
    references: [club.id],
  }),
  book: one(book, {
    fields: [clubBook.bookId],
    references: [book.id],
  }),
}));

export const meetingConfirmationRelations = relations(
  meetingConfirmation,
  ({ one }) => ({
    meeting: one(meeting, {
      fields: [meetingConfirmation.meetingId],
      references: [meeting.id],
    }),
    member: one(member, {
      fields: [meetingConfirmation.memberId],
      references: [member.id],
    }),
  })
);
