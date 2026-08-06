import { NextResponse } from "next/server";

import { searchSites } from "@/lib/services/search";
import { fail, ok } from "@/lib/utils/api-response";
import {
  checkRateLimit,
  clientIpFromRequest,
} from "@/lib/utils/rate-limit";
import { searchRequestSchema } from "@/lib/validators/search";

export async function POST(request: Request) {
  const ip = clientIpFromRequest(request);
  const limit = checkRateLimit({
    key: `search:${ip}`,
    limit: 60,
    windowMs: 60 * 1000,
  });
  if (!limit.ok) {
    return NextResponse.json(fail("Too many searches. Slow down a moment."), {
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

  const parsed = searchRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(fail("Query must be between 2 and 200 characters"), {
      status: 400,
    });
  }

  /**
   * Discovery spends a model call and writes new catalog rows, so it gets a
   * far tighter budget than plain search. Exceeding it degrades to a
   * catalog-only answer instead of failing the request.
   */
  const allowDiscovery =
    parsed.data.discover &&
    checkRateLimit({
      key: `discover:${ip}`,
      limit: 10,
      windowMs: 60 * 1000,
    }).ok;

  try {
    const data = await searchSites({
      query: parsed.data.query,
      limit: parsed.data.limit,
      recordPageHit: true,
      allowDiscovery,
    });
    return NextResponse.json(ok(data));
  } catch (error) {
    console.error("POST /api/search failed:", error);
    return NextResponse.json(fail("Search failed"), { status: 500 });
  }
}
