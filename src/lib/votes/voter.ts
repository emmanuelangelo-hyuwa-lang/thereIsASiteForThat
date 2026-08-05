import { createHmac, randomUUID, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

/**
 * Anonymous voter identity.
 *
 * There are no accounts yet, so a "voter" is a signed random token in an
 * HttpOnly cookie. Two rules keep it honest:
 *
 *  1. The token is never stored raw. What lands in the database is
 *     HMAC(secret, token + siteId), per-site, so rows cannot be correlated
 *     into a browsing history even if the table leaks.
 *  2. A device may only vote on a site it has actually clicked through to.
 *     Eligibility is recorded in a second cookie when the outbound click is
 *     tracked, so the right to vote is earned by using the link.
 */

const VOTER_COOKIE = "tias_voter";
const VISITED_COOKIE = "tias_visited";
const VOTER_MAX_AGE = 60 * 60 * 24 * 365; // 1 year
const VISIT_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
/** Cookies are sent on every request, keep the visited list short. */
const MAX_VISITS = 16;

function secret(): string {
  return (
    process.env.VOTE_SECRET ??
    process.env.AUTH_SECRET ??
    process.env.ADMIN_SESSION_SECRET ??
    "tias-dev-only-vote-secret"
  );
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function issueVoterToken(): string {
  const token = randomUUID();
  return `${token}.${sign(token).slice(0, 32)}`;
}

function tokenIsValid(raw: string | undefined): raw is string {
  if (!raw) return false;
  const [token, signature] = raw.split(".");
  if (!token || !signature) return false;
  return safeEqual(signature, sign(token).slice(0, 32));
}

/** Opaque, per-site voter key. Same device + same site always maps here. */
export function voterHashFor(rawToken: string, siteId: string): string {
  return sign(`${rawToken}::${siteId}`);
}

/** Short site fingerprint, so the visited cookie stays small. */
export function visitKey(siteId: string): string {
  return sign(`visit::${siteId}`).slice(0, 10);
}

export const voterCookie = {
  name: VOTER_COOKIE,
  maxAge: VOTER_MAX_AGE,
} as const;

export const visitedCookie = {
  name: VISITED_COOKIE,
  maxAge: VISIT_MAX_AGE,
} as const;

export async function readVoterToken(): Promise<string | null> {
  const raw = (await cookies()).get(VOTER_COOKIE)?.value;
  return tokenIsValid(raw) ? raw : null;
}

export function parseVoterToken(raw: string | undefined): string | null {
  return tokenIsValid(raw) ? raw : null;
}

export function parseVisited(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw.split(".").filter(Boolean).slice(0, MAX_VISITS);
}

export function appendVisit(raw: string | undefined, siteId: string): string {
  const key = visitKey(siteId);
  const existing = parseVisited(raw).filter((entry) => entry !== key);
  return [key, ...existing].slice(0, MAX_VISITS).join(".");
}

export async function hasVisited(siteId: string): Promise<boolean> {
  const raw = (await cookies()).get(VISITED_COOKIE)?.value;
  return parseVisited(raw).includes(visitKey(siteId));
}
