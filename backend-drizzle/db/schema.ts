import {
  pgTable,
  varchar,
  text,
  timestamp,
  date,
  time,
  integer,
  real,
  pgEnum,
  uniqueIndex,
  index,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

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
export const readingModeEnum = pgEnum("ReadingModeEnum", ["book", "chapters"]);
export const confirmationStatusEnum = pgEnum("ConfirmationStatusEnum", [
  "going",
  "not_going",
  "maybe",
]);
export const feedbackTypeEnum = pgEnum("FeedbackTypeEnum", [
  "bug",
  "idea",
  "other",
]);
export const clubVisibilityEnum = pgEnum("ClubVisibilityEnum", [
  "private",
  "public",
]);
export const clubJoinPolicyEnum = pgEnum("ClubJoinPolicyEnum", [
  "open",
  "approval",
]);
export const meetingFormatEnum = pgEnum("MeetingFormatEnum", [
  "in_person",
  "remote",
  "hybrid",
]);
export const membershipRequestStatusEnum = pgEnum(
  "MembershipRequestStatusEnum",
  ["pending", "approved", "rejected", "cancelled"],
);
export const readingDrawModeEnum = pgEnum("ReadingDrawModeEnum", [
  "direct",
  "vote",
  "last_standing",
]);
export const readingDrawStatusEnum = pgEnum("ReadingDrawStatusEnum", [
  "nominating",
  "awaiting_book",
  "completed",
  "cancelled",
  "expired",
]);

// State / City (IBGE — PK = código IBGE)
export const state = pgTable(
  "State",
  {
    id: integer("id").primaryKey(),
    code: varchar("code", { length: 2 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
  },
  (table) => [uniqueIndex("State_code_key").on(table.code)]
);

export const city = pgTable(
  "City",
  {
    id: integer("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    stateId: integer("state_id")
      .notNull()
      .references(() => state.id, { onDelete: "restrict" }),
    latitude: real("latitude"),
    longitude: real("longitude"),
  },
  (table) => [
    index("City_state_id_idx").on(table.stateId),
    uniqueIndex("City_state_id_name_key").on(table.stateId, table.name),
  ]
);

// Book
export const book = pgTable("Book", {
  id: varchar("id", { length: 255 }).primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  author: varchar("author", { length: 255 }),
  coverUrl: varchar("cover_url", { length: 255 }),
  openLibraryId: varchar("open_library_id", { length: 255 }),
  totalChapters: integer("total_chapters"),
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
  googleRefreshToken: text("google_refresh_token"),
  googleAccessTokenExpiresAt: timestamp(
    "google_access_token_expires_at",
    { withTimezone: true, precision: 6 }
  ),
  googleCalendarId: varchar("google_calendar_id", { length: 255 }),
  googleAccountEmail: varchar("google_account_email", { length: 255 }),
  passwordResetTokenHash: varchar("password_reset_token_hash", { length: 255 }),
  passwordResetExpiresAt: timestamp("password_reset_expires_at", {
    withTimezone: true,
    precision: 6,
  }),
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
    readingMode: readingModeEnum("reading_mode").default("book").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, precision: 6 })
      .defaultNow()
      .notNull(),
    description: text("description").notNull(),
    visibility: clubVisibilityEnum("visibility").default("private").notNull(),
    joinPolicy: clubJoinPolicyEnum("join_policy").default("open").notNull(),
    meetingFormat: meetingFormatEnum("meeting_format"),
    stateId: integer("state_id").references(() => state.id, {
      onDelete: "restrict",
    }),
    cityId: integer("city_id").references(() => city.id, {
      onDelete: "restrict",
    }),
  },
  (table) => [
    uniqueIndex("Club_invitation_code_key").on(table.invitationCode),
    index("Club_visibility_idx").on(table.visibility),
    index("Club_city_id_idx").on(table.cityId),
  ]
);

// Meeting
export const meeting = pgTable("Meeting", {
  id: varchar("id", { length: 255 }).primaryKey(),
  clubId: varchar("club_id", { length: 255 })
    .notNull()
    .references(() => club.id, { onDelete: "cascade" }),
  createdByUserId: varchar("created_by_user_id", { length: 255 }).references(
    () => user.id,
    { onDelete: "set null" }
  ),
  location: varchar("location", { length: 255 }).notNull(),
  meetingDate: date("meeting_date").notNull(),
  meetingTime: time("meeting_time").notNull(),
  description: text("description"),
  status: meetingStatusEnum("status").default("scheduled").notNull(),
  chapterStart: integer("chapter_start"),
  chapterEnd: integer("chapter_end"),
  googleEventId: varchar("google_event_id", { length: 512 }),
  googleCalendarId: varchar("google_calendar_id", { length: 255 }),
  googleSyncedAt: timestamp("google_synced_at", {
    withTimezone: true,
    precision: 6,
  }),
  googleSyncError: text("google_sync_error"),
  recapPromptDismissedAt: timestamp("recap_prompt_dismissed_at", {
    withTimezone: true,
    precision: 6,
  }),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 })
    .defaultNow()
    .notNull(),
});

// MeetingBook
export const meetingBook = pgTable(
  "MeetingBook",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    meetingId: varchar("meeting_id", { length: 255 })
      .notNull()
      .references(() => meeting.id, { onDelete: "cascade" }),
    bookId: varchar("book_id", { length: 255 })
      .notNull()
      .references(() => book.id, { onDelete: "restrict" }),
    position: integer("position").notNull(),
  },
  (table) => [
    uniqueIndex("MeetingBook_meeting_id_book_id_key").on(
      table.meetingId,
      table.bookId
    ),
  ]
);

// MeetingRecap
export const meetingRecap = pgTable(
  "MeetingRecap",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    meetingId: varchar("meeting_id", { length: 255 })
      .notNull()
      .references(() => meeting.id, { onDelete: "cascade" }),
    createdByUserId: varchar("created_by_user_id", { length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    text: text("text"),
    imageUrl: varchar("image_url", { length: 1024 }),
    imagePublicId: varchar("image_public_id", { length: 512 }),
    createdAt: timestamp("created_at", { withTimezone: true, precision: 6 })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 })
      .defaultNow()
      .notNull()
      .$onUpdateFn(() => new Date()),
    deletedAt: timestamp("deleted_at", { withTimezone: true, precision: 6 }),
  },
  (table) => [
    uniqueIndex("MeetingRecap_meeting_id_active_key")
      .on(table.meetingId)
      .where(sql`${table.deletedAt} is null`),
  ]
);

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

// MembershipRequest
export const membershipRequest = pgTable(
  "MembershipRequest",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    clubId: varchar("club_id", { length: 255 })
      .notNull()
      .references(() => club.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: membershipRequestStatusEnum("status").default("pending").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, precision: 6 })
      .defaultNow()
      .notNull(),
    resolvedAt: timestamp("resolved_at", {
      withTimezone: true,
      precision: 6,
    }),
  },
  (table) => [
    uniqueIndex("MembershipRequest_club_id_user_id_pending_key")
      .on(table.clubId, table.userId)
      .where(sql`${table.status} = 'pending'`),
    index("MembershipRequest_club_id_status_idx").on(
      table.clubId,
      table.status,
    ),
  ],
);

// Review
export const review = pgTable("Review", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  bookId: varchar("book_id", { length: 255 })
    .notNull()
    .references(() => book.id, { onDelete: "cascade" }),
  /** 0–5 com meias estrelas (ex.: 0.5, 4.5); não usar integer no PG. */
  rating: real("rating"),
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
      .default("not_started")
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
    suggestedByUserId: varchar("suggested_by_user_id", { length: 255 }).references(
      () => user.id,
      { onDelete: "set null" },
    ),
    status: bookStatusEnum("status").default("suggested").notNull(),
    addedAt: timestamp("added_at", { withTimezone: true, precision: 3 })
      .defaultNow()
      .notNull(),
    finishedAt: timestamp("finished_at", { withTimezone: true, precision: 3 }),
    deletedAt: timestamp("deleted_at", { withTimezone: true, precision: 3 }),
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

export const feedback = pgTable("Feedback", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: feedbackTypeEnum("type").notNull(),
  message: text("message").notNull(),
  pageUrl: text("page_url").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, precision: 6 })
    .defaultNow()
    .notNull(),
});

// ReadingDraw (sorteio da próxima leitura)
export const readingDraw = pgTable(
  "ReadingDraw",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    clubId: varchar("club_id", { length: 255 })
      .notNull()
      .references(() => club.id, { onDelete: "cascade" }),
    hostUserId: varchar("host_user_id", { length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    mode: readingDrawModeEnum("mode").notNull(),
    status: readingDrawStatusEnum("status").default("nominating").notNull(),
    shareCode: varchar("share_code", { length: 255 }).notNull(),
    deadlineAt: timestamp("deadline_at", {
      withTimezone: true,
      precision: 6,
    }).notNull(),
    winnerNominationId: varchar("winner_nomination_id", {
      length: 255,
    }).references((): AnyPgColumn => readingDrawNomination.id, {
      onDelete: "set null",
    }),
    winningClubBookId: varchar("winning_club_book_id", { length: 255 }).references(
      () => clubBook.id,
      { onDelete: "set null" },
    ),
    voteVotesPerParticipant: integer("vote_votes_per_participant"),
    voteRound: integer("vote_round"),
    revealStartedAt: timestamp("reveal_started_at", {
      withTimezone: true,
      precision: 6,
    }),
    createdAt: timestamp("created_at", { withTimezone: true, precision: 6 })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, precision: 6 })
      .defaultNow()
      .notNull()
      .$onUpdateFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("ReadingDraw_share_code_key").on(table.shareCode),
    uniqueIndex("ReadingDraw_club_id_active_key")
      .on(table.clubId)
      .where(
        sql`${table.status} IN ('nominating', 'awaiting_book')`,
      ),
    index("ReadingDraw_club_id_status_idx").on(table.clubId, table.status),
  ],
);

export const readingDrawParticipant = pgTable(
  "ReadingDrawParticipant",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    drawId: varchar("draw_id", { length: 255 })
      .notNull()
      .references(() => readingDraw.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("ReadingDrawParticipant_draw_id_user_id_key").on(
      table.drawId,
      table.userId,
    ),
  ],
);

export const readingDrawNomination = pgTable(
  "ReadingDrawNomination",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    drawId: varchar("draw_id", { length: 255 })
      .notNull()
      .references(() => readingDraw.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    author: varchar("author", { length: 255 }),
    confirmedAt: timestamp("confirmed_at", {
      withTimezone: true,
      precision: 6,
    }),
    eliminatedAt: timestamp("eliminated_at", {
      withTimezone: true,
      precision: 6,
    }),
    eliminationRound: integer("elimination_round"),
  },
  (table) => [
    uniqueIndex("ReadingDrawNomination_draw_id_user_id_key").on(
      table.drawId,
      table.userId,
    ),
  ],
);

export const readingDrawVote = pgTable(
  "ReadingDrawVote",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    drawId: varchar("draw_id", { length: 255 })
      .notNull()
      .references(() => readingDraw.id, { onDelete: "cascade" }),
    round: integer("round").notNull(),
    voterUserId: varchar("voter_user_id", { length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    nominationId: varchar("nomination_id", { length: 255 })
      .notNull()
      .references(() => readingDrawNomination.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true, precision: 6 })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("ReadingDrawVote_draw_round_voter_nomination_key").on(
      table.drawId,
      table.round,
      table.voterUserId,
      table.nominationId,
    ),
    index("ReadingDrawVote_draw_id_round_idx").on(table.drawId, table.round),
  ],
);

// Relations (for query API - optional, used with db.query)
export const stateRelations = relations(state, ({ many }) => ({
  cities: many(city),
}));

export const cityRelations = relations(city, ({ one }) => ({
  state: one(state, {
    fields: [city.stateId],
    references: [state.id],
  }),
}));

export const bookRelations = relations(book, ({ many }) => ({
  clubBooks: many(clubBook),
  userBooks: many(userBook),
  reviews: many(review),
  meetingBooks: many(meetingBook),
}));

export const userRelations = relations(user, ({ many }) => ({
  clubs: many(club),
  members: many(member),
  userBooks: many(userBook),
  reviews: many(review),
  meetingsCreated: many(meeting),
  meetingRecapsCreated: many(meetingRecap),
  feedbacks: many(feedback),
  readingDrawsHosted: many(readingDraw),
  readingDrawParticipations: many(readingDrawParticipant),
  readingDrawNominations: many(readingDrawNomination),
  readingDrawVotes: many(readingDrawVote),
}));

export const clubRelations = relations(club, ({ one, many }) => ({
  owner: one(user, {
    fields: [club.ownerId],
    references: [user.id],
  }),
  state: one(state, {
    fields: [club.stateId],
    references: [state.id],
  }),
  city: one(city, {
    fields: [club.cityId],
    references: [city.id],
  }),
  meetings: many(meeting),
  members: many(member),
  clubBooks: many(clubBook),
  membershipRequests: many(membershipRequest),
  readingDraws: many(readingDraw),
}));

export const membershipRequestRelations = relations(
  membershipRequest,
  ({ one }) => ({
    club: one(club, {
      fields: [membershipRequest.clubId],
      references: [club.id],
    }),
    user: one(user, {
      fields: [membershipRequest.userId],
      references: [user.id],
    }),
  }),
);

export const meetingRelations = relations(meeting, ({ one, many }) => ({
  club: one(club, {
    fields: [meeting.clubId],
    references: [club.id],
  }),
  createdBy: one(user, {
    fields: [meeting.createdByUserId],
    references: [user.id],
  }),
  meetingBooks: many(meetingBook),
  confirmations: many(meetingConfirmation),
  recaps: many(meetingRecap),
}));

export const meetingBookRelations = relations(meetingBook, ({ one }) => ({
  meeting: one(meeting, {
    fields: [meetingBook.meetingId],
    references: [meeting.id],
  }),
  book: one(book, {
    fields: [meetingBook.bookId],
    references: [book.id],
  }),
}));

export const meetingRecapRelations = relations(meetingRecap, ({ one }) => ({
  meeting: one(meeting, {
    fields: [meetingRecap.meetingId],
    references: [meeting.id],
  }),
  createdBy: one(user, {
    fields: [meetingRecap.createdByUserId],
    references: [user.id],
  }),
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
  suggestedBy: one(user, {
    fields: [clubBook.suggestedByUserId],
    references: [user.id],
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

export const feedbackRelations = relations(feedback, ({ one }) => ({
  user: one(user, {
    fields: [feedback.userId],
    references: [user.id],
  }),
}));

export const readingDrawRelations = relations(readingDraw, ({ one, many }) => ({
  club: one(club, {
    fields: [readingDraw.clubId],
    references: [club.id],
  }),
  host: one(user, {
    fields: [readingDraw.hostUserId],
    references: [user.id],
  }),
  participants: many(readingDrawParticipant),
  nominations: many(readingDrawNomination, {
    relationName: "drawNominations",
  }),
  votes: many(readingDrawVote),
  winnerNomination: one(readingDrawNomination, {
    fields: [readingDraw.winnerNominationId],
    references: [readingDrawNomination.id],
    relationName: "drawWinner",
  }),
  winningClubBook: one(clubBook, {
    fields: [readingDraw.winningClubBookId],
    references: [clubBook.id],
  }),
}));

export const readingDrawParticipantRelations = relations(
  readingDrawParticipant,
  ({ one }) => ({
    draw: one(readingDraw, {
      fields: [readingDrawParticipant.drawId],
      references: [readingDraw.id],
    }),
    user: one(user, {
      fields: [readingDrawParticipant.userId],
      references: [user.id],
    }),
  }),
);

export const readingDrawNominationRelations = relations(
  readingDrawNomination,
  ({ one, many }) => ({
    draw: one(readingDraw, {
      fields: [readingDrawNomination.drawId],
      references: [readingDraw.id],
      relationName: "drawNominations",
    }),
    wonDraw: one(readingDraw, {
      fields: [readingDrawNomination.id],
      references: [readingDraw.winnerNominationId],
      relationName: "drawWinner",
    }),
    user: one(user, {
      fields: [readingDrawNomination.userId],
      references: [user.id],
    }),
    votes: many(readingDrawVote),
  }),
);

export const readingDrawVoteRelations = relations(
  readingDrawVote,
  ({ one }) => ({
    draw: one(readingDraw, {
      fields: [readingDrawVote.drawId],
      references: [readingDraw.id],
    }),
    voter: one(user, {
      fields: [readingDrawVote.voterUserId],
      references: [user.id],
    }),
    nomination: one(readingDrawNomination, {
      fields: [readingDrawVote.nominationId],
      references: [readingDrawNomination.id],
    }),
  }),
);
