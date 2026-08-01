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
