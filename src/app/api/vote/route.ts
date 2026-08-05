import { NextResponse } from "next/server";
import { z } from "zod";

import { castVote, VoteError } from "@/lib/services/votes";
import { fail, ok } from "@/lib/utils/api-response";
import { checkRateLimit, clientIpFromRequest } from "@/lib/utils/rate-limit";
import {
  parseVisited,
  parseVoterToken,
  visitedCookie,
  visitKey,
  voterCookie,
} from "@/lib/votes/voter";

const voteSchema = z.object({
  siteId: z.string().min(1),
  solved: z.boolean(),
});

export async function POST(request: Request) {
  const limit = checkRateLimit({
    key: `vote:${clientIpFromRequest(request)}`,
    limit: 20,
    windowMs: 60_000,
  });

  if (!limit.ok) {
    return NextResponse.json(fail("Slow down a moment"), {
      status: 429,
      headers: { "Retry-After": String(limit.retryAfterSec) },
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(fail("Invalid JSON body"), { status: 400 });
  }

  const parsed = voteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(fail("Invalid vote payload"), { status: 400 });
  }

  // No token means this device never clicked through to anything.
  const voterToken = parseVoterToken(
    request.headers
      .get("cookie")
      ?.split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${voterCookie.name}=`))
      ?.slice(voterCookie.name.length + 1),
  );

  if (!voterToken) {
    return NextResponse.json(fail("Visit the site before judging it"), {
      status: 403,
    });
  }

  const visitedRaw = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${visitedCookie.name}=`))
    ?.slice(visitedCookie.name.length + 1);

  try {
    const result = await castVote({
      siteId: parsed.data.siteId,
      solved: parsed.data.solved,
      voterToken,
      visitedSiteIds: parseVisited(visitedRaw),
      visitKeyOf: visitKey,
    });
    return NextResponse.json(ok(result));
  } catch (error) {
    if (error instanceof VoteError) {
      return NextResponse.json(fail(error.message), { status: error.status });
    }
    console.error("POST /api/vote failed:", error);
    return NextResponse.json(fail("Could not record that vote"), {
      status: 500,
    });
  }
}
