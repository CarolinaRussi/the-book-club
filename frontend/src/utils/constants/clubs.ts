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
