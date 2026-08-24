import { findPendingReviewReminderRows } from "../repositories/reviewReminderRepository";
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
