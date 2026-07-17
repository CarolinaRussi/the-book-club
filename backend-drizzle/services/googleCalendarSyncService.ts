import * as meetingRepository from "../repositories/meetingRepository";
import * as memberRepository from "../repositories/memberRepository";
import * as userRepository from "../repositories/userRepository";
import {
  getCalendarClientForUserId,
  GoogleCalendarNotConnectedError,
} from "../utils/googleCalendarClient";
import { toMeetingDateYmd } from "../utils/meetingDate";

const DEFAULT_DURATION_MIN = 120;
const DEFAULT_TIMEZONE = "America/Sao_Paulo";
const RECONNECT_MSG =
  "Acesso ao Google expirou ou foi revogado. Reconecte em Conta e tente sincronizar de novo.";

function meetingDurationMinutes(): number {
  const raw = process.env.GOOGLE_CALENDAR_MEETING_DURATION_MINUTES?.trim();
  if (!raw) return DEFAULT_DURATION_MIN;
  const minutes = Number(raw);
  return Number.isFinite(minutes) && minutes > 0 && minutes <= 24 * 60
    ? minutes
    : DEFAULT_DURATION_MIN;
}

function calendarTimeZone(): string {
  return (
    process.env.CALENDAR_DEFAULT_TIMEZONE?.trim() || DEFAULT_TIMEZONE
  );
}

function truncateMessage(text: string, max = 1800): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 3)}...`;
}

function isInvalidGoogleAuth(error: unknown): boolean {
  const raw = formatGoogleCalendarFailure(error).toLowerCase();
  return raw.includes("invalid_grant") || /\b401\b/.test(raw);
}

async function recordSyncFailure(
  meetingId: string,
  createdByUserId: string | null | undefined,
  error: unknown,
): Promise<string> {
  if (createdByUserId && isInvalidGoogleAuth(error)) {
    await userRepository.clearUserGoogleOAuth(createdByUserId);
    await meetingRepository.updateMeetingGoogleCalendarFields(meetingId, {
      googleSyncError: RECONNECT_MSG,
    });
    return RECONNECT_MSG;
  }
  const message = formatGoogleCalendarFailure(error);
  await meetingRepository.updateMeetingGoogleCalendarFields(meetingId, {
    googleSyncError: message,
  });
  return message;
}

function formatGoogleCalendarFailure(error: unknown): string {
  if (error && typeof error === "object" && "response" in error) {
    const googleError = error as {
      response?: { status?: number; statusText?: string; data?: unknown };
    };
    const status = googleError.response?.status;
    const data = googleError.response?.data;
    const body =
      typeof data === "string"
        ? data
        : data !== undefined
          ? JSON.stringify(data)
          : "";
    return truncateMessage(
      `Google Calendar ${status ?? "?"} ${googleError.response?.statusText ?? ""} ${body}`.trim(),
    );
  }
  if (error instanceof Error) {
    return truncateMessage(error.message);
  }
  return "Erro desconhecido ao falar com o Google Calendar.";
}

function normalizeTime(time: string): string {
  const parts = String(time).split(":");
  const hours = parts[0] ?? "00";
  const minutes = parts[1] ?? "00";
  const seconds = (parts[2] ?? "00").slice(0, 2);
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:${seconds.padStart(2, "0")}`;
}

function addMinutesToWallClock(
  dateStr: string,
  timeStr: string,
  minutesToAdd: number,
): { dateStr: string; timeStr: string } {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes, rawSeconds] = timeStr.split(":").map(Number);
  const seconds = rawSeconds || 0;
  const totalMinutes = hours * 60 + minutes + minutesToAdd;
  const dayDelta = Math.floor(totalMinutes / (24 * 60));
  const minutesInDay = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const endHours = Math.floor(minutesInDay / 60);
  const endMinutes = minutesInDay % 60;
  const cursor = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  cursor.setUTCDate(cursor.getUTCDate() + dayDelta);
  const pad = (value: number) => String(value).padStart(2, "0");
  return {
    dateStr: `${cursor.getUTCFullYear()}-${pad(cursor.getUTCMonth() + 1)}-${pad(cursor.getUTCDate())}`,
    timeStr: `${pad(endHours)}:${pad(endMinutes)}:${pad(seconds)}`,
  };
}

function buildStartEndDateTime(
  meetingDate: string | Date,
  meetingTime: string,
): { start: { dateTime: string; timeZone: string }; end: { dateTime: string; timeZone: string } } {
  const dateStr = toMeetingDateYmd(meetingDate);
  const timeStr = normalizeTime(meetingTime);
  const timeZone = calendarTimeZone();
  const end = addMinutesToWallClock(
    dateStr,
    timeStr,
    meetingDurationMinutes(),
  );
  return {
    start: { dateTime: `${dateStr}T${timeStr}`, timeZone },
    end: { dateTime: `${end.dateStr}T${end.timeStr}`, timeZone },
  };
}

type MeetingForCal = NonNullable<
  Awaited<ReturnType<typeof meetingRepository.findMeetingForGoogleCalendar>>
>;

function buildSummary(meeting: MeetingForCal): string {
  const bookTitle = meeting.book?.title?.trim();
  if (bookTitle) {
    return `Encontro: ${bookTitle}`;
  }
  return `Encontro — ${meeting.club?.name ?? "Entrelivros"}`;
}

function buildDescription(meeting: MeetingForCal): string {
  const lines: string[] = [];
  if (meeting.club?.name) {
    lines.push(`Clube: ${meeting.club.name}`);
  }
  if (meeting.book?.title) {
    lines.push(`Livro: ${meeting.book.title}`);
  }
  if (meeting.chapterStart != null && meeting.chapterEnd != null) {
    lines.push(`Capítulos: ${meeting.chapterStart}–${meeting.chapterEnd}`);
  }
  if (meeting.description?.trim()) {
    lines.push(meeting.description.trim());
  }
  lines.push(`Local: ${meeting.location}`);
  return lines.join("\n\n");
}

export type GoogleCalendarCreateResult =
  | { ok: true; skipped: true; googleEventId: string }
  | { ok: true; skipped: false; googleEventId: string; calendarId: string }
  | { ok: false; error: string };

export async function createGoogleCalendarEventForMeeting(
  meetingId: string,
): Promise<GoogleCalendarCreateResult> {
  const meeting = await meetingRepository.findMeetingForGoogleCalendar(meetingId);
  if (!meeting) {
    return { ok: false, error: "Meeting não encontrada." };
  }
  if (meeting.googleEventId) {
    return { ok: true, skipped: true, googleEventId: meeting.googleEventId };
  }
  if (!meeting.createdByUserId) {
    return {
      ok: false,
      error: "Meeting sem created_by_user_id; não é possível escolher calendário.",
    };
  }

  try {
    const { calendar, calendarId } = await getCalendarClientForUserId(
      meeting.createdByUserId,
    );
    const attendeeEmails =
      await memberRepository.findActiveMemberEmailsByClubId(meeting.clubId);
    const attendees = attendeeEmails.map((email) => ({ email }));

    const { start, end } = buildStartEndDateTime(
      meeting.meetingDate,
      meeting.meetingTime,
    );

    const insertResult = await calendar.events.insert({
      calendarId,
      sendUpdates: "all",
      requestBody: {
        summary: buildSummary(meeting),
        description: buildDescription(meeting),
        location: meeting.location,
        start,
        end,
        attendees: attendees.length > 0 ? attendees : undefined,
      },
    });

    const eventId = insertResult.data.id;
    if (!eventId) {
      const message = "Google não devolveu id do evento.";
      await meetingRepository.updateMeetingGoogleCalendarFields(meetingId, {
        googleSyncError: truncateMessage(message),
      });
      return { ok: false, error: message };
    }

    await meetingRepository.updateMeetingGoogleCalendarFields(meetingId, {
      googleEventId: eventId,
      googleCalendarId: calendarId,
      googleSyncedAt: new Date(),
      googleSyncError: null,
    });

    return {
      ok: true,
      skipped: false,
      googleEventId: eventId,
      calendarId,
    };
  } catch (error) {
    if (error instanceof GoogleCalendarNotConnectedError) {
      return { ok: false, error: error.message };
    }
    const message = await recordSyncFailure(
      meetingId,
      meeting.createdByUserId,
      error,
    );
    return { ok: false, error: message };
  }
}

export type GoogleCalendarSimpleResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updateGoogleCalendarEventForMeeting(
  meetingId: string,
): Promise<GoogleCalendarSimpleResult> {
  const meeting = await meetingRepository.findMeetingForGoogleCalendar(meetingId);
  if (!meeting?.googleEventId || !meeting.googleCalendarId) {
    return { ok: false, error: "Meeting sem evento Google associado." };
  }
  if (!meeting.createdByUserId) {
    return { ok: false, error: "Meeting sem created_by_user_id." };
  }

  try {
    const { calendar, calendarId } = await getCalendarClientForUserId(
      meeting.createdByUserId,
    );
    const { start, end } = buildStartEndDateTime(
      meeting.meetingDate,
      meeting.meetingTime,
    );
    const attendeeEmails =
      await memberRepository.findActiveMemberEmailsByClubId(meeting.clubId);
    const attendees = attendeeEmails.map((email) => ({ email }));

    await calendar.events.patch({
      calendarId: meeting.googleCalendarId ?? calendarId,
      eventId: meeting.googleEventId,
      sendUpdates: "all",
      requestBody: {
        summary: buildSummary(meeting),
        description: buildDescription(meeting),
        location: meeting.location,
        start,
        end,
        attendees: attendees.length > 0 ? attendees : undefined,
      },
    });

    await meetingRepository.updateMeetingGoogleCalendarFields(meetingId, {
      googleSyncedAt: new Date(),
      googleSyncError: null,
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof GoogleCalendarNotConnectedError) {
      const message = error.message;
      await meetingRepository.updateMeetingGoogleCalendarFields(meetingId, {
        googleSyncError: truncateMessage(message),
      });
      return { ok: false, error: message };
    }
    const message = await recordSyncFailure(
      meetingId,
      meeting.createdByUserId,
      error,
    );
    return { ok: false, error: message };
  }
}

export async function deleteGoogleCalendarEventForMeeting(
  meetingId: string,
): Promise<GoogleCalendarSimpleResult> {
  const meeting = await meetingRepository.findMeetingForGoogleCalendar(meetingId);
  if (!meeting?.googleEventId || !meeting.googleCalendarId) {
    return { ok: true };
  }
  if (!meeting.createdByUserId) {
    return { ok: false, error: "Meeting sem created_by_user_id." };
  }

  try {
    const { calendar } = await getCalendarClientForUserId(
      meeting.createdByUserId,
    );
    try {
      await calendar.events.delete({
        calendarId: meeting.googleCalendarId,
        eventId: meeting.googleEventId,
        sendUpdates: "all",
      });
    } catch (error) {
      const message = formatGoogleCalendarFailure(error);
      if (!message.includes("404")) {
        const recorded = await recordSyncFailure(
          meetingId,
          meeting.createdByUserId,
          error,
        );
        return { ok: false, error: recorded };
      }
    }

    await meetingRepository.updateMeetingGoogleCalendarFields(meetingId, {
      googleEventId: null,
      googleCalendarId: null,
      googleSyncedAt: new Date(),
      googleSyncError: null,
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof GoogleCalendarNotConnectedError) {
      return { ok: true };
    }
    const message = await recordSyncFailure(
      meetingId,
      meeting.createdByUserId,
      error,
    );
    return { ok: false, error: message };
  }
}
