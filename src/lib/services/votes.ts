import {
  getExistingVote,
  getVerdictMap,
  getVerdictTally,
  upsertVote,
  type VerdictMap,
} from "@/lib/repositories/votes";
import { isSeedCatalogId } from "@/lib/services/catalog";
import { hasVisited, readVoterToken, voterHashFor } from "@/lib/votes/voter";

/** Below this, a percentage would be noise pretending to be data. */
export const MIN_VERDICTS = 3;

export type Verdict = {
  solved: number;
  total: number;
  /** Percentage of voters who said the site solved their task, or null. */
  solveRate: number | null;
  /** What this device already said, if anything. */
  myVote: boolean | null;
  /** Whether this device has earned the right to vote (it clicked through). */
  canVote: boolean;
};

export function solveRateOf(tally: {
  solved: number;
  total: number;
}): number | null {
  if (tally.total < MIN_VERDICTS) {
    return null;
  }
  return Math.round((tally.solved / tally.total) * 100);
}

export async function getVerdict(siteId: string): Promise<Verdict> {
  if (isSeedCatalogId(siteId)) {
    return { solved: 0, total: 0, solveRate: null, myVote: null, canVote: false };
  }

  const [tally, token, visited] = await Promise.all([
    getVerdictTally(siteId),
    readVoterToken(),
    hasVisited(siteId),
  ]);

  const myVote = token
    ? await getExistingVote({
        siteId,
        voterHash: voterHashFor(token, siteId),
      })
    : null;

  return {
    ...tally,
    solveRate: solveRateOf(tally),
    myVote,
    canVote: visited,
  };
}

export async function listVerdicts(siteIds: string[]): Promise<VerdictMap> {
  return getVerdictMap(siteIds);
}

export class VoteError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export async function castVote(input: {
  siteId: string;
  solved: boolean;
  voterToken: string;
  visitedSiteIds: string[];
  visitKeyOf: (siteId: string) => string;
}): Promise<{ solved: number; total: number; solveRate: number | null }> {
  if (isSeedCatalogId(input.siteId)) {
    throw new VoteError("Voting needs the live catalog", 409);
  }

  if (!input.visitedSiteIds.includes(input.visitKeyOf(input.siteId))) {
    throw new VoteError("Visit the site before judging it", 403);
  }

  await upsertVote({
    siteId: input.siteId,
    voterHash: voterHashFor(input.voterToken, input.siteId),
    solved: input.solved,
  });

  const tally = await getVerdictTally(input.siteId);
  return { ...tally, solveRate: solveRateOf(tally) };
}
