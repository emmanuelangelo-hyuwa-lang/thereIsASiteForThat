import { NextResponse } from "next/server";

import { searchSites } from "@/lib/services/search";
import { fail, ok } from "@/lib/utils/api-response";
import { searchRequestSchema } from "@/lib/validators/search";

export async function POST(request: Request) {
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

  try {
    const data = await searchSites({
      query: parsed.data.query,
      limit: parsed.data.limit,
      recordPageHit: true,
    });
    return NextResponse.json(ok(data));
  } catch (error) {
    console.error("POST /api/search failed:", error);
    return NextResponse.json(fail("Search failed"), { status: 500 });
  }
}
