export function absoluteUrl(base: string, path: string): string {
  const root = base.replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${root}${suffix}`;
}
