import * as meetingRepository from "../repositories/meetingRepository";
import * as memberRepository from "../repositories/memberRepository";
import {
  getCalendarClientForUserId,
  GoogleCalendarNotConnectedError,
} from "../utils/googleCalendarClient";

const DEFAULT_DURATION_MIN = 120;
const DEFAULT_TIMEZONE = "America/Sao_Paulo";

function meetingDurationMinutes(): number {
  const raw = process.env.GOOGLE_CALENDAR_MEETING_DURATION_MINUTES?.trim();
  if (!raw) return DEFAULT_DURATION_MIN;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 && n <= 24 * 60 ? n : DEFAULT_DURATION_MIN;
}

function calendarTimeZone(): string {
  return (
    process.env.CALENDAR_DEFAULT_TIMEZONE?.trim() || DEFAULT_TIMEZONE
  );
}

function truncateMessage(s: string, max = 1800): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 3)}...`;
}

function formatGoogleCalendarFailure(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const r = err as {
      response?: { status?: number; statusText?: string; data?: unknown };
    };
    const status = r.response?.status;
    const data = r.response?.data;
    const body =
      typeof data === "string"
        ? data
        : data !== undefined
          ? JSON.stringify(data)
          : "";
    return truncateMessage(
      `Google Calendar ${status ?? "?"} ${r.response?.statusText ?? ""} ${body}`.trim(),
    );
  }
  if (err instanceof Error) {
    return truncateMessage(err.message);
  }
  return "Erro desconhecido ao falar com o Google Calendar.";
}

function normalizeTime(t: string): string {
  const parts = t.split(":");
  const h = parts[0] ?? "00";
  const m = parts[1] ?? "00";
  const s = (parts[2] ?? "00").slice(0, 2);
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}:${s.padStart(2, "0")}`;
}

function meetingDateToYmd(d: string | Date): string {
  if (typeof d === "string") {
    return d.slice(0, 10);
  }
  return d.toISOString().slice(0, 10);
}

function buildStartEndDateTime(
  meetingDate: string | Date,
  meetingTime: string,
): { start: { dateTime: string; timeZone: string }; end: { dateTime: string; timeZone: string } } {
  const dateStr = meetingDateToYmd(meetingDate);
  const timeStr = normalizeTime(meetingTime);
  const tz = calendarTimeZone();
  const startLocal = new Date(`${dateStr}T${timeStr}`);
  const endLocal = new Date(
    startLocal.getTime() + meetingDurationMinutes() * 60_000,
  );
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (dt: Date) =>
    `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`;
  return {
    start: { dateTime: fmt(startLocal), timeZone: tz },
    end: { dateTime: fmt(endLocal), timeZone: tz },
  };
}

type MeetingForCal = NonNullable<
  Awaited<ReturnType<typeof meetingRepository.findMeetingForGoogleCalendar>>
>;

function buildSummary(m: MeetingForCal): string {
  const book = m.book?.title?.trim();
  if (book) {
    return `Encontro: ${book}`;
  }
  return `Encontro — ${m.club?.name ?? "The Book Club"}`;
}

function buildDescription(m: MeetingForCal): string {
  const lines: string[] = [];
  if (m.club?.name) {
    lines.push(`Clube: ${m.club.name}`);
  }
  if (m.book?.title) {
    lines.push(`Livro: ${m.book.title}`);
  }
  if (m.chapterStart != null && m.chapterEnd != null) {
    lines.push(`Capítulos: ${m.chapterStart}–${m.chapterEnd}`);
  }
  if (m.description?.trim()) {
    lines.push(m.description.trim());
  }
  lines.push(`Local: ${m.location}`);
  return lines.join("\n\n");
}

export type GoogleCalendarCreateResult =
  | { ok: true; skipped: true; googleEventId: string }
  | { ok: true; skipped: false; googleEventId: string; calendarId: string }
  | { ok: false; error: string };

export async function createGoogleCalendarEventForMeeting(
  meetingId: string,
): Promise<GoogleCalendarCreateResult> {
  const m = await meetingRepository.findMeetingForGoogleCalendar(meetingId);
  if (!m) {
    return { ok: false, error: "Meeting não encontrada." };
  }
  if (m.googleEventId) {
    return { ok: true, skipped: true, googleEventId: m.googleEventId };
  }
  if (!m.createdByUserId) {
    const msg =
      "Meeting sem created_by_user_id; não é possível escolher calendário.";
    await meetingRepository.updateMeetingGoogleCalendarFields(meetingId, {
      googleSyncError: truncateMessage(msg),
    });
    return { ok: false, error: msg };
  }

  try {
    const { calendar, calendarId } = await getCalendarClientForUserId(
      m.createdByUserId,
    );
    const attendeeEmails =
      await memberRepository.findActiveMemberEmailsByClubId(m.clubId);
    const attendees = attendeeEmails.map((email) => ({ email }));

    const { start, end } = buildStartEndDateTime(m.meetingDate, m.meetingTime);

    const res = await calendar.events.insert({
      calendarId,
      sendUpdates: "all",
      requestBody: {
        summary: buildSummary(m),
        description: buildDescription(m),
        location: m.location,
        start,
        end,
        attendees: attendees.length > 0 ? attendees : undefined,
      },
    });

    const eventId = res.data.id;
    if (!eventId) {
      const msg = "Google não devolveu id do evento.";
      await meetingRepository.updateMeetingGoogleCalendarFields(meetingId, {
        googleSyncError: truncateMessage(msg),
      });
      return { ok: false, error: msg };
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
  } catch (err) {
    if (err instanceof GoogleCalendarNotConnectedError) {
      const msg = err.message;
      await meetingRepository.updateMeetingGoogleCalendarFields(meetingId, {
        googleSyncError: truncateMessage(msg),
      });
      return { ok: false, error: msg };
    }
    const msg = formatGoogleCalendarFailure(err);
    await meetingRepository.updateMeetingGoogleCalendarFields(meetingId, {
      googleSyncError: msg,
    });
    return { ok: false, error: msg };
  }
}

export type GoogleCalendarSimpleResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updateGoogleCalendarEventForMeeting(
  meetingId: string,
): Promise<GoogleCalendarSimpleResult> {
  const m = await meetingRepository.findMeetingForGoogleCalendar(meetingId);
  if (!m?.googleEventId || !m.googleCalendarId) {
    return { ok: false, error: "Meeting sem evento Google associado." };
  }
  if (!m.createdByUserId) {
    return { ok: false, error: "Meeting sem created_by_user_id." };
  }

  try {
    const { calendar, calendarId } = await getCalendarClientForUserId(
      m.createdByUserId,
    );
    const { start, end } = buildStartEndDateTime(m.meetingDate, m.meetingTime);
    const attendeeEmails =
      await memberRepository.findActiveMemberEmailsByClubId(m.clubId);
    const attendees = attendeeEmails.map((email) => ({ email }));

    await calendar.events.patch({
      calendarId: m.googleCalendarId ?? calendarId,
      eventId: m.googleEventId,
      sendUpdates: "all",
      requestBody: {
        summary: buildSummary(m),
        description: buildDescription(m),
        location: m.location,
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
  } catch (err) {
    const msg = formatGoogleCalendarFailure(err);
    await meetingRepository.updateMeetingGoogleCalendarFields(meetingId, {
      googleSyncError: msg,
    });
    return { ok: false, error: msg };
  }
}

export async function deleteGoogleCalendarEventForMeeting(
  meetingId: string,
): Promise<GoogleCalendarSimpleResult> {
  const m = await meetingRepository.findMeetingForGoogleCalendar(meetingId);
  if (!m?.googleEventId || !m.googleCalendarId) {
    return { ok: true };
  }
  if (!m.createdByUserId) {
    return { ok: false, error: "Meeting sem created_by_user_id." };
  }

  try {
    const { calendar } = await getCalendarClientForUserId(m.createdByUserId);
    try {
      await calendar.events.delete({
        calendarId: m.googleCalendarId,
        eventId: m.googleEventId,
        sendUpdates: "all",
      });
    } catch (err) {
      const msg = formatGoogleCalendarFailure(err);
      if (!msg.includes("404")) {
        await meetingRepository.updateMeetingGoogleCalendarFields(meetingId, {
          googleSyncError: msg,
        });
        return { ok: false, error: msg };
      }
    }

    await meetingRepository.updateMeetingGoogleCalendarFields(meetingId, {
      googleEventId: null,
      googleCalendarId: null,
      googleSyncedAt: new Date(),
      googleSyncError: null,
    });
    return { ok: true };
  } catch (err) {
    const msg = formatGoogleCalendarFailure(err);
    await meetingRepository.updateMeetingGoogleCalendarFields(meetingId, {
      googleSyncError: msg,
    });
    return { ok: false, error: msg };
  }
}
