import { NextResponse } from "next/server";

import { fail, ok } from "@/lib/utils/api-response";
import { slugify } from "@/lib/utils/slugify";
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

  // Placeholder until embeddings + pgvector search are wired.
  return NextResponse.json(
    ok({
      query: parsed.data.query,
      slug: slugify(parsed.data.query),
      mode: "unavailable" as const,
      results: [],
      aiSummary: "Search is scaffolded but not connected to the catalog yet.",
    }),
  );
}
