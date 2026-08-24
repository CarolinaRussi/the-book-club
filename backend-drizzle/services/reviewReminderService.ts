import { getFrontendUrl } from "../utils/emailConfig";
import { findPendingReviewReminderRows } from "../repositories/reviewReminderRepository";
import { sendReviewReminderEmail } from "./emailService";
import {
  groupPendingReviewReminderRows,
  type ReviewReminderDigest,
} from "./reviewReminderDigest";

export async function listReviewReminderDigests(): Promise<
  ReviewReminderDigest[]
> {
  const rows = await findPendingReviewReminderRows();
  return groupPendingReviewReminderRows(rows);
}

export type SendReviewReminderDigestsResult = {
  recipients: number;
  sent: number;
  failed: number;
};

export async function sendReviewReminderDigests(options?: {
  redirectTo?: string;
}): Promise<SendReviewReminderDigestsResult> {
  const frontendUrl = getFrontendUrl();
  const digests = await listReviewReminderDigests();
  const redirectTo = options?.redirectTo?.trim();
  if (redirectTo) {
    console.log(
      `[reviews:remind] redirecionando ${digests.length} e-mail(s) para ${redirectTo}`,
    );
  }
  let sent = 0;
  let failed = 0;

  for (const digest of digests) {
    const to = redirectTo || digest.userEmail;
    try {
      await sendReviewReminderEmail({
        to,
        clubs: digest.clubs.map((clubSection) => ({
          clubName: clubSection.clubName,
          books: clubSection.books.map((bookItem) => ({
            title: bookItem.title,
            url: `${frontendUrl}/books/${bookItem.bookId}`,
          })),
        })),
      });
      sent += 1;
    } catch (error) {
      failed += 1;
      console.error(
        `[reviews:remind] falha userId=${digest.userId} email=${digest.userEmail} to=${to}`,
        error,
      );
    }
  }

  return { recipients: digests.length, sent, failed };
}
