import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { recordOutboundClick } from "@/lib/services/clicks";
import { fail, ok } from "@/lib/utils/api-response";
import {
  appendVisit,
  issueVoterToken,
  parseVoterToken,
  visitedCookie,
  voterCookie,
} from "@/lib/votes/voter";

function cookieValue(request: Request, name: string): string | undefined {
  return request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(fail("Invalid JSON body"), { status: 400 });
  }

  try {
    const data = await recordOutboundClick(body);
    const response = NextResponse.json(ok(data));

    // Clicking through is what earns the right to judge a site afterwards.
    const siteId =
      typeof body === "object" && body !== null && "siteId" in body
        ? String((body as { siteId: unknown }).siteId)
        : null;

    if (siteId) {
      const token =
        parseVoterToken(cookieValue(request, voterCookie.name)) ??
        issueVoterToken();
      const secure = process.env.NODE_ENV === "production";

      response.cookies.set(voterCookie.name, token, {
        httpOnly: true,
        sameSite: "lax",
        secure,
        path: "/",
        maxAge: voterCookie.maxAge,
      });

      response.cookies.set(
        visitedCookie.name,
        appendVisit(cookieValue(request, visitedCookie.name), siteId),
        {
          httpOnly: true,
          sameSite: "lax",
          secure,
          path: "/",
          maxAge: visitedCookie.maxAge,
        },
      );
    }

    return response;
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
