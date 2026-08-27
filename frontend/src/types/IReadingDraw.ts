export type ReadingDrawMode = "direct" | "vote" | "last_standing";

export type ReadingDrawStatus =
  | "nominating"
  | "awaiting_book"
  | "completed"
  | "cancelled"
  | "expired";

export type ReadingDrawViewerRole = "host" | "participant" | "spectator";

export interface IReadingDrawUserSummary {
  id: string;
  name: string;
  nickname: string;
  profilePicture: string | null;
}

export interface IReadingDrawParticipant {
  id: string;
  userId: string;
  user: IReadingDrawUserSummary;
}

export interface IReadingDrawNomination {
  id: string;
  userId: string;
  title: string;
  author: string | null;
  confirmedAt: string | null;
  eliminatedAt: string | null;
  eliminationRound: number | null;
}

export interface IReadingDraw {
  id: string;
  clubId: string;
  hostUserId: string;
  mode: ReadingDrawMode;
  status: ReadingDrawStatus;
  shareCode: string;
  deadlineAt: string;
  winnerNominationId: string | null;
  winningClubBookId: string | null;
  voteVotesPerParticipant: number | null;
  voteRound: number | null;
  revealStartedAt: string | null;
  createdAt: string;
  updatedAt: string;
  viewerRole: ReadingDrawViewerRole;
  club: { id: string; name: string } | null;
  host: IReadingDrawUserSummary | null;
  participants: IReadingDrawParticipant[];
  nominations: IReadingDrawNomination[];
  myVoteNominationIds: string[];
  votersWhoVotedCount: number;
  voterUserIdsWhoVoted: string[];
}

export type ReadingDrawCreateMode = Extract<
  ReadingDrawMode,
  "direct" | "last_standing" | "vote"
>;

export interface ICreateReadingDrawPayload {
  participantUserIds: string[];
  deadlineAt?: string;
  mode?: ReadingDrawCreateMode;
  voteVotesPerParticipant?: number;
}
