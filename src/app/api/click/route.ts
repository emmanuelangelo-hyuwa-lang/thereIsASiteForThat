import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { recordOutboundClick } from "@/lib/services/clicks";
import { fail, ok } from "@/lib/utils/api-response";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(fail("Invalid JSON body"), { status: 400 });
  }

  try {
    const data = await recordOutboundClick(body);
    return NextResponse.json(ok(data));
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(fail("Invalid click payload"), { status: 400 });
    }
    if (error instanceof Error && error.message === "Site not found") {
      return NextResponse.json(fail("Site not found"), { status: 404 });
    }
    console.error("POST /api/click failed:", error);
    return NextResponse.json(fail("Failed to record click"), { status: 500 });
  }
}
