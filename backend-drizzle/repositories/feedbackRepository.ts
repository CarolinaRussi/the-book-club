import { db } from "../db/client";
import { feedback } from "../db/schema";

export async function insertFeedback(values: typeof feedback.$inferInsert) {
  const [row] = await db.insert(feedback).values(values).returning();
  return row ?? null;
}
