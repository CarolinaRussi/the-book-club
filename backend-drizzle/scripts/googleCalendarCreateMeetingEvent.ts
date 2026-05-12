import "dotenv/config";
import { createGoogleCalendarEventForMeeting } from "../services/googleCalendarSyncService";

const meetingId = process.env.MEETING_ID?.trim();
if (!meetingId) {
  console.error("Defina MEETING_ID (id da meeting no Postgres).");
  process.exit(1);
}

createGoogleCalendarEventForMeeting(meetingId)
  .then((r) => {
    console.log(JSON.stringify(r, null, 2));
    process.exit(r.ok ? 0 : 1);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
