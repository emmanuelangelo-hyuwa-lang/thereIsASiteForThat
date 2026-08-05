import { and, count, eq, inArray, sql } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { siteVotes } from "@/lib/db/schema";

export type VerdictTally = {
  solved: number;
  total: number;
};

export type VerdictMap = Map<string, VerdictTally>;

/**
 * Every read is best-effort. Before `db:migrate` runs on an existing
 * deployment the table simply is not there yet, and the catalog must keep
 * rendering, the editor score covers the gap.
 */
async function safe<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await operation();
  } catch {
    return fallback;
  }
}

export async function getVerdictTally(siteId: string): Promise<VerdictTally> {
  return safe(async () => {
    const [row] = await getDb()
      .select({
        total: count(),
        solved: sql<number>`count(*) filter (where ${siteVotes.solved})`.mapWith(
          Number,
        ),
      })
      .from(siteVotes)
      .where(eq(siteVotes.siteId, siteId));

    return { solved: row?.solved ?? 0, total: row?.total ?? 0 };
  }, { solved: 0, total: 0 });
}

export async function getVerdictMap(siteIds: string[]): Promise<VerdictMap> {
  const ids = siteIds.filter((id) => !id.startsWith("seed_"));
  if (ids.length === 0) {
    return new Map();
  }

  return safe(async () => {
    const rows = await getDb()
      .select({
        siteId: siteVotes.siteId,
        total: count(),
        solved: sql<number>`count(*) filter (where ${siteVotes.solved})`.mapWith(
          Number,
        ),
      })
      .from(siteVotes)
      .where(inArray(siteVotes.siteId, ids))
      .groupBy(siteVotes.siteId);

    return new Map(
      rows.map((row) => [row.siteId, { solved: row.solved, total: row.total }]),
    );
  }, new Map());
}

export async function getExistingVote(input: {
  siteId: string;
  voterHash: string;
}): Promise<boolean | null> {
  return safe(async () => {
    const [row] = await getDb()
      .select({ solved: siteVotes.solved })
      .from(siteVotes)
      .where(
        and(
          eq(siteVotes.siteId, input.siteId),
          eq(siteVotes.voterHash, input.voterHash),
        ),
      )
      .limit(1);

    return row?.solved ?? null;
  }, null);
}

/** One row per (site, voter). Voting again replaces the previous verdict. */
export async function upsertVote(input: {
  siteId: string;
  voterHash: string;
  solved: boolean;
}): Promise<void> {
  await getDb()
    .insert(siteVotes)
    .values({
      siteId: input.siteId,
      voterHash: input.voterHash,
      solved: input.solved,
    })
    .onConflictDoUpdate({
      target: [siteVotes.siteId, siteVotes.voterHash],
      set: { solved: input.solved, updatedAt: new Date() },
    });
}
