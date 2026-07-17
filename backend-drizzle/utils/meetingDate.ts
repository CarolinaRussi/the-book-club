export function toMeetingDateYmd(meetingDate: string | Date): string {
  if (typeof meetingDate === "string") {
    const ymd = meetingDate.trim().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
      throw new Error("invalid_meeting_date");
    }
    return ymd;
  }
  const year = meetingDate.getFullYear();
  const month = String(meetingDate.getMonth() + 1).padStart(2, "0");
  const day = String(meetingDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
