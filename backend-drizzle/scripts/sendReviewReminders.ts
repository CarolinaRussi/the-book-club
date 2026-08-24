import "dotenv/config";
import { getFeedbackToEmail } from "../utils/emailConfig";
import { sendReviewReminderDigests } from "../services/reviewReminderService";

const cliArgs = process.argv.slice(2).filter((arg) => arg !== "--");
const wantsFeedbackInbox = cliArgs.includes("--feedback");
const explicitTo = cliArgs.find((arg) => arg !== "--feedback")?.trim();

const redirectTo = wantsFeedbackInbox
  ? getFeedbackToEmail()
  : explicitTo;

sendReviewReminderDigests({ redirectTo })
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.failed > 0 ? 1 : 0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
