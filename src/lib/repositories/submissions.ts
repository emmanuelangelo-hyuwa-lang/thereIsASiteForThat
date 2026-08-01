import { desc, eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { submissions } from "@/lib/db/schema";

export type SubmissionInsert = typeof submissions.$inferInsert;

export async function insertSubmission(values: SubmissionInsert) {
  const rows = await getDb().insert(submissions).values(values).returning();
  return rows[0]!;
}

export async function listPendingSubmissions() {
  return getDb()
    .select()
    .from(submissions)
    .where(eq(submissions.status, "pending"))
    .orderBy(desc(submissions.createdAt));
}

export async function getSubmissionById(id: string) {
  const rows = await getDb()
    .select()
    .from(submissions)
    .where(eq(submissions.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getPendingOrApprovedSubmissionByUrl(url: string) {
  const rows = await getDb()
    .select()
    .from(submissions)
    .where(eq(submissions.url, url))
    .orderBy(desc(submissions.createdAt))
    .limit(5);

  return (
    rows.find(
      (row) => row.status === "pending" || row.status === "approved",
    ) ?? null
  );
}

export async function updateSubmissionStatus(
  id: string,
  status: "approved" | "rejected",
  adminNotes?: string,
) {
  const rows = await getDb()
    .update(submissions)
    .set({
      status,
      adminNotes: adminNotes ?? null,
      reviewedAt: new Date(),
    })
    .where(eq(submissions.id, id))
    .returning();
  return rows[0] ?? null;
}

export async function countPendingSubmissions(): Promise<number> {
  const rows = await listPendingSubmissions();
  return rows.length;
}
