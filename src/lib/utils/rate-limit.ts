type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
};

/**
 * Simple in-memory sliding window. Good enough for single-region / low abuse;
 * resets per serverless instance.
 */
export function checkRateLimit(input: {
  key: string;
  limit: number;
  windowMs: number;
}): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(input.key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(input.key, { count: 1, resetAt: now + input.windowMs });
    return {
      ok: true,
      remaining: input.limit - 1,
      retryAfterSec: Math.ceil(input.windowMs / 1000),
    };
  }

  if (existing.count >= input.limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return {
    ok: true,
    remaining: input.limit - existing.count,
    retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
  };
}

export function clientIpFromRequest(request: Request): string {
  return clientIpFromHeaders(request.headers);
}

/** Same rule, for server components, which get headers() rather than a Request. */
export function clientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}

const BOT_UA =
  /bot|crawler|spider|crawling|slurp|bingpreview|facebookexternalhit|embedly|quora link preview|whatsapp|telegram|discord|preview|headless|lighthouse|python-requests|curl|wget|axios|go-http-client/i;

/**
 * Cheap crawler sniff, for deciding whether a request earns expensive work.
 *
 * Deliberately generous: a false positive costs a bot the AI answer it was
 * never going to read, while a false negative costs a model call. It is not a
 * security control and is not used as one.
 */
export function looksLikeBot(userAgent: string | null): boolean {
  if (!userAgent) {
    // A browser always sends one. Something that does not is not a reader.
    return true;
  }
  return BOT_UA.test(userAgent);
}
