/**
 * Hosts that must never be fetched or stored. Discovery URLs come out of a
 * language model, so they are untrusted input that the server later requests
 * itself during the liveness check; without this an invented hostname could
 * point the check at the deploy's own network.
 */
const PRIVATE_HOST = /^(localhost|.*\.local|.*\.internal)$/i;
const IP_LITERAL = /^\d{1,3}(\.\d{1,3}){3}$|^\[/;
const PLACEHOLDER_HOST = /(^|\.)(example|test|invalid|localhost)\.(com|org|net)$/i;

/**
 * Normalize a model-proposed URL, or return null when it is not a plain public
 * https website address.
 */
export function normalizePublicSiteUrl(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }

  if (url.protocol !== "https:") {
    return null;
  }
  if (url.port !== "" || url.username || url.password) {
    return null;
  }

  const host = url.hostname;
  if (
    PRIVATE_HOST.test(host) ||
    IP_LITERAL.test(host) ||
    PLACEHOLDER_HOST.test(host) ||
    !host.includes(".")
  ) {
    return null;
  }

  url.hostname = host.toLowerCase();
  url.search = "";
  url.hash = "";

  return normalizeUrl(url.toString());
}

/**
 * The same site written both ways. `https://x.com` and `https://www.x.com` are
 * one website but two unique rows, so duplicate checks have to look for both.
 */
export function urlVariants(url: string): string[] {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return [url];
  }

  const bare = parsed.hostname.replace(/^www\./, "");
  const variants = new Set<string>();

  for (const host of [bare, `www.${bare}`]) {
    const candidate = new URL(parsed.toString());
    candidate.hostname = host;
    variants.add(normalizeUrl(candidate.toString()));
  }

  return [...variants];
}

export function normalizeUrl(raw: string): string {
  const url = new URL(raw.trim());
  url.hash = "";
  for (const key of [...url.searchParams.keys()]) {
    if (key.toLowerCase().startsWith("utm_")) {
      url.searchParams.delete(key);
    }
  }

  let href = url.toString();
  if (href.endsWith("/") && url.pathname === "/") {
    // keep root trailing slash behavior consistent: strip trailing slash after host
    href = href.slice(0, -1);
  } else if (href.endsWith("/") && url.pathname.length > 1) {
    href = href.slice(0, -1);
  }

  return href;
}
