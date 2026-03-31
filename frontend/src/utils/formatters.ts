import { format } from "date-fns";

export const getInitials = (name: string) => {
  if (!name?.trim()) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function parseDate(value: string | Date | undefined): Date | null {
  if (value == null) return null;
  if (value instanceof Date)
    return Number.isNaN(value.getTime()) ? null : value;
  const s = String(value).trim();
  if (!s) return null;
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(s) ? `${s}T12:00:00` : s);
  return Number.isNaN(d.getTime()) ? null : d;
}

const monthLongPt = (d: Date) =>
  capitalize(new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(d));

export const formatMonthYear = (dateString: string): string => {
  const date = parseDate(dateString);
  if (!date) return "";
  return `${monthLongPt(date)} ${date.getFullYear()}`;
};

export const formatDayMonthYear = (
  dateValue: string | Date | undefined,
): string => {
  const date = parseDate(dateValue);
  if (!date) return "";
  const day = String(date.getDate()).padStart(2, "0");
  return `${day} de ${monthLongPt(date)} de ${date.getFullYear()}`;
};

export const formatTime = (timeValue: string | undefined): string => {
  const str = timeValue?.trim();
  if (!str) return "";
  const m = str.match(/^(\d{1,2}):(\d{2})(?::\d{2})?/);
  if (m) return `${m[1].padStart(2, "0")}:${m[2].padStart(2, "0")}`;
  const d = new Date(str);
  if (Number.isNaN(d.getTime())) return "";
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

export function formatMeetingDateForApi(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function formatMeetingTimeForApi(timeFromInput: string): string {
  const t = timeFromInput.trim();
  if (!t) return "00:00:00";
  const [h = "0", m = "0", rawS = "00"] = t.split(":");
  const s = rawS.replace(/\D/g, "").slice(0, 2).padStart(2, "0");
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}:${s}`;
}
