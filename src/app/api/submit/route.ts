import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { createPublicSubmission } from "@/lib/services/submissions";
import { fail, ok } from "@/lib/utils/api-response";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(fail("Invalid JSON body"), { status: 400 });
  }

  try {
    const data = await createPublicSubmission(body);
    return NextResponse.json(ok(data));
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        fail("Check the form — description must be at least 40 characters and URL valid."),
        { status: 400 },
      );
    }
    if (error instanceof Error) {
      return NextResponse.json(fail(error.message), { status: 400 });
    }
    return NextResponse.json(fail("Submission failed"), { status: 500 });
  }
}
