export const CLUB_STATUS_VALUES = [
  "active",
  "inactive",
] as const;

export type ClubStatus = (typeof CLUB_STATUS_VALUES)[number];

export const CLUB_STATUS_ACTIVE: ClubStatus = "active";
export const CLUB_STATUS_INACTIVE: ClubStatus = "inactive";

export const clubStatusLabels: Record<ClubStatus, string> = {
  [CLUB_STATUS_ACTIVE]: "Ativo",
  [CLUB_STATUS_INACTIVE]: "Inativo",
};

export const CLUB_READING_MODE_VALUES = ["book", "chapters"] as const;

export type ClubReadingMode = (typeof CLUB_READING_MODE_VALUES)[number];

export const CLUB_READING_MODE_BOOK: ClubReadingMode = "book";
export const CLUB_READING_MODE_CHAPTERS: ClubReadingMode = "chapters";

export const clubReadingModeLabels: Record<ClubReadingMode, string> = {
  [CLUB_READING_MODE_BOOK]: "Por livro",
  [CLUB_READING_MODE_CHAPTERS]: "Por capítulos",
};

export const CLUB_VISIBILITY_VALUES = ["private", "public"] as const;

export type ClubVisibility = (typeof CLUB_VISIBILITY_VALUES)[number];

export const CLUB_VISIBILITY_PRIVATE: ClubVisibility = "private";
export const CLUB_VISIBILITY_PUBLIC: ClubVisibility = "public";

export const clubVisibilityLabels: Record<ClubVisibility, string> = {
  [CLUB_VISIBILITY_PRIVATE]: "Privado (só por convite)",
  [CLUB_VISIBILITY_PUBLIC]: "Público (aparece em Explorar)",
};

export const CLUB_JOIN_POLICY_VALUES = ["open", "approval"] as const;

export type ClubJoinPolicy = (typeof CLUB_JOIN_POLICY_VALUES)[number];

export const CLUB_JOIN_POLICY_OPEN: ClubJoinPolicy = "open";
export const CLUB_JOIN_POLICY_APPROVAL: ClubJoinPolicy = "approval";

export const clubJoinPolicyLabels: Record<ClubJoinPolicy, string> = {
  [CLUB_JOIN_POLICY_OPEN]: "Entrada livre",
  [CLUB_JOIN_POLICY_APPROVAL]: "Precisa de aprovação",
};

export const MEETING_FORMAT_VALUES = [
  "in_person",
  "remote",
  "hybrid",
] as const;

export type MeetingFormat = (typeof MEETING_FORMAT_VALUES)[number];

export const meetingFormatLabels: Record<MeetingFormat, string> = {
  in_person: "Presencial",
  remote: "Remoto",
  hybrid: "Híbrido",
};

export const PUBLIC_CLUB_DESCRIPTION_MIN_LENGTH = 40;
