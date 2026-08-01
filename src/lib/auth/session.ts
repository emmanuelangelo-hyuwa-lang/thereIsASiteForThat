import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "tias_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("ADMIN_SESSION_SECRET must be set (min 16 characters)");
  }
  return secret;
}

function sign(value: string): string {
  return createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}

export function createAdminSessionToken(now = Date.now()): string {
  const expiresAt = String(now + SESSION_TTL_MS);
  const signature = sign(expiresAt);
  return `${expiresAt}.${signature}`;
}

export function verifyAdminSessionToken(token: string | undefined): boolean {
  if (!token) {
    return false;
  }

  const [expiresAt, signature] = token.split(".");
  if (!expiresAt || !signature) {
    return false;
  }

  const expected = sign(expiresAt);
  if (!safeEqual(signature, expected)) {
    return false;
  }

  const expiry = Number.parseInt(expiresAt, 10);
  if (!Number.isFinite(expiry) || expiry < Date.now()) {
    return false;
  }

  return true;
}

export async function setAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function hasAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    return verifyAdminSessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
  } catch {
    return false;
  }
}

export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return false;
  }
  const left = Buffer.from(password);
  const right = Buffer.from(expected);
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}
