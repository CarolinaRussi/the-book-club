export const CLUB_THEME_STORAGE_KEY = "@bookclub:clubTheme";

export type ClubThemeId =
  | "classic"
  | "classic-dark"
  | "oceanic"
  | "greenery";

const VALID_THEMES: ClubThemeId[] = [
  "classic",
  "classic-dark",
  "oceanic",
  "greenery",
];

export function isClubThemeId(value: string | null): value is ClubThemeId {
  return value !== null && VALID_THEMES.includes(value as ClubThemeId);
}

export function applyClubTheme(theme: ClubThemeId): void {
  const root = document.documentElement;
  root.classList.remove("oceanic", "greenery", "dark");
  if (theme === "oceanic") root.classList.add("oceanic");
  if (theme === "greenery") root.classList.add("greenery");
  if (theme === "classic-dark") root.classList.add("dark");
}

export function getStoredClubTheme(): ClubThemeId {
  try {
    const raw = localStorage.getItem(CLUB_THEME_STORAGE_KEY);
    if (isClubThemeId(raw)) return raw;
  } catch {
    /* ignore */
  }
  return "classic";
}

export function persistClubTheme(theme: ClubThemeId): void {
  try {
    localStorage.setItem(CLUB_THEME_STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
  applyClubTheme(theme);
}
