import "dotenv/config";
import { createGoogleCalendarEventForMeeting } from "../services/googleCalendarSyncService";

const meetingId = process.env.MEETING_ID?.trim();
if (!meetingId) {
  console.error("Defina MEETING_ID (id da meeting no Postgres).");
  process.exit(1);
}

createGoogleCalendarEventForMeeting(meetingId)
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.ok ? 0 : 1);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
