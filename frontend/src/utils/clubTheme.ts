/** Classes em `index.css` que alteram a paleta (`:root`, `.oceanic`, `.greenery`). */
export const CLUB_THEME_STORAGE_KEY = "@bookclub:clubTheme";

export type ClubThemeId = "classic" | "oceanic" | "greenery";

const VALID_THEMES: ClubThemeId[] = ["classic", "oceanic", "greenery"];

export function isClubThemeId(value: string | null): value is ClubThemeId {
  return value !== null && VALID_THEMES.includes(value as ClubThemeId);
}

/** Aplica o tema no `<html>` (mesmas classes definidas em `index.css`). */
export function applyClubTheme(theme: ClubThemeId): void {
  const root = document.documentElement;
  root.classList.remove("oceanic", "greenery");
  if (theme === "oceanic") root.classList.add("oceanic");
  if (theme === "greenery") root.classList.add("greenery");
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
